/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import NotesPath from './notes-path'
import NotesFileFilter from './notes-file-filter'
import getAdjustedScrollTop from './get-adjusted-scroll-top'
import {start as calcPaginationStart, limit as calcPaginationLimit} from './pagination'

export default class Interactor {

  editCellNameP: Bacon.Property
  forcedScrollTopP: Bacon.Property
  listHeightP: Bacon.Property
  loadingS: Bacon.Stream
  notesP: Bacon.Property
  notesPathP: Bacon.Property
  openFileS: Bacon.Stream
  paginationP: Bacon.Property
  rowHeightP: Bacon.Property
  saveEditedCellContentS: Bacon.Stream
  selectedRelPathS: Bacon.Stream
  sifterResultP: Bacon.Property

  constructor (viewCtrl: ViewCtrlType, pathWatcherFactory: PathWatcherFactoryType, service: ServiceType) {
    this.loadingS = viewCtrl.sessionStartS
    this.openFileS = viewCtrl.keyEnterS
    this.notesPathP = viewCtrl.sessionStartS.map('.rootPath').map(NotesPath).toProperty()
    this.saveEditedCellContentS = viewCtrl.saveEditedCellContentS

    const pathWatcherP = Bacon
      .combineTemplate({
        req: viewCtrl.sessionStartS,
        notesPath: this.notesPathP
      })
      .map((t: {req: SessionType, notesPath: NotesPathType}) => {
        const notesFileFilter = new NotesFileFilter(t.req.rootPath, {
          ignoredNames: t.req.ignoredNames,
          excludeVcsIgnoredPaths: t.req.excludeVcsIgnoredPaths
        })
        return pathWatcherFactory.watch(service.notes, t.notesPath, notesFileFilter)
      })

    const sifterP = pathWatcherP.flatMap(pw => pw.sifterP).toProperty()
    this.notesP = sifterP.map('.items')

    const initialPathScanDoneS = pathWatcherP.flatMap(pw => pw.initialScanDoneP)
    const readyS = initialPathScanDoneS.take(1)
    const resetS = viewCtrl.keyEscS.merge(readyS)
    const searchS = resetS.map('').merge(viewCtrl.textInputS).skipDuplicates()

    this.sifterResultP = Bacon
      .combineTemplate({
        fields: service.fieldsP,
        query: searchS,
        sifter: sifterP,
        sortDirection: viewCtrl.sortDirectionS,
        sortField: viewCtrl.sortFieldS
      })
      .map((t: {fields: Array<FieldType>, sortDirection: string, sortField: string, query: string, sifter: {search: (query: string, options: Object) => Object}}) => {
        // see https://github.com/brianreavis/sifter.js/#searchquery-options for available configuration options
        return t.sifter.search(t.query, {
          fields: t.fields.map(field => field.notePropName),
          sort: [
            {field: t.sortField, direction: t.sortDirection},
            {field: '$score', direction: t.sortDirection}
          ],
          conjunction: 'and'
        })
      })

    this.listHeightP = Bacon
      .update(0,
        [viewCtrl.listHeightS], R.nthArg(-1),
        [viewCtrl.sessionStartS.map('.listHeight')], R.nthArg(-1))
      .skipDuplicates()

    this.rowHeightP = Bacon
      .update(0,
        [viewCtrl.rowHeightS], R.nthArg(-1),
        [viewCtrl.sessionStartS.map('.rowHeight')], R.nthArg(-1))
      .skipDuplicates()

    const itemsP = this.sifterResultP.map('.items')

    this.selectedRelPathS = Bacon
      .update(undefined,
        [viewCtrl.activePathS, this.notesPathP, this.notesP], (old, path, notesPath, notes) => {
          const relPath = notesPath.relPath(path)
          const note = notes[relPath]
          if (note) {
            return relPath
          }
        },
        [viewCtrl.keyUpS, this.notesPathP, itemsP], (oldRelPath, _, notesPath, items) => {
          // stop at beginning of list; start from end of list if there was no old selected index
          const oldIndex = oldRelPath && items.findIndex(item => item.id === oldRelPath)
          let newIndex = isNaN(oldIndex) ? items.length : oldIndex
          newIndex = Math.max(newIndex - 1, 0)
          return items[newIndex].id
        },
        [viewCtrl.keyDownS, this.notesPathP, itemsP], (oldRelPath, _, notesPath, items) => {
          // stop at end of list; start from the beginning of list if there was no old selected index
          const oldIndex = oldRelPath && items.findIndex(item => item.id === oldRelPath)
          let newIndex = isNaN(oldIndex) ? -1 : oldIndex
          newIndex = Math.min(newIndex + 1, items.length - 1)
          return items[newIndex].id
        },
        [viewCtrl.clickedCellS], R.nthArg(-1),
        [resetS], undefined,
        [searchS], undefined,
        [this.notesP.changes(), this.saveEditedCellContentS.toProperty()], (oldRelPath, notes, lastEditedCellContent) => {
          return Object
            .keys(notes)
            .find(relPath => relPath === oldRelPath || relPath === lastEditedCellContent)
        })
      .changes()
      .skipDuplicates()

    const selectedIndexS = Bacon
      .combineTemplate({
        items: itemsP,
        selectedRelPath: this.selectedRelPathS
      })
      .map((t: {items: Array<Object>, selectedRelPath?: string}) => {
        const {selectedRelPath} = t
        if (!selectedRelPath) return undefined

        const index = t.items.findIndex(item => item.id === selectedRelPath)
        return index !== -1 ? index : undefined
      })
      .changes()
      .skipDuplicates()

    this.forcedScrollTopP = Bacon
      .update(
        undefined,
        [resetS], 0,
        [searchS], 0,
        [viewCtrl.scrollTopS], undefined,
        [selectedIndexS, viewCtrl.scrollTopS.toProperty(0), this.listHeightP, this.rowHeightP],
          (selectedScrollTop, index, scrollTop, listHeight, rowHeight) => {
            return getAdjustedScrollTop({
              selectedIndex: index,
              scrollTop: Number.isInteger(selectedScrollTop) ? selectedScrollTop : scrollTop,
              rowHeight: rowHeight,
              visibleHeight: listHeight
            })
          },
        [viewCtrl.sessionStartS], undefined)
      .skipDuplicates()

    const scrollTopS = this.forcedScrollTopP.changes().filter(R.is(Number)).merge(viewCtrl.scrollTopS)

    this.paginationP = Bacon
      .update(
        {start: 0, limit: 0},
        [searchS], old => ({start: 0, limit: old.limit}),
        [scrollTopS, this.rowHeightP], (old, scrollTop, rowHeight) => {
          return {
            start: calcPaginationStart({rowHeight: rowHeight, scrollTop: scrollTop}),
            limit: old.limit
          }
        },
        [this.listHeightP.toEventStream(), this.rowHeightP], (old, listHeight, rowHeight) => {
          return {
            start: old.start,
            limit: calcPaginationLimit({rowHeight: rowHeight, listHeight: listHeight})
          }
        })
      .skipDuplicates()

    this.editCellNameP = Bacon
      .update(undefined,
        [service.editCellS], R.nthArg(-1),
        [viewCtrl.dblClickedCellS.map('.editCellName')], R.nthArg(-1),
        [viewCtrl.abortEditCellS], undefined,
        [this.selectedRelPathS], undefined,
        [this.saveEditedCellContentS.delay(0)], undefined) // delay to have it changed in next tick, to not affect current observables side-effects
  }

}
