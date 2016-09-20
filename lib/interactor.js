/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import NotesPath from './notes-path'
import NotesFileFilter from './notes-file-filter'
import getAdjustedScrollTop from './get-adjusted-scroll-top'
import {start as calcPaginationStart, limit as calcPaginationLimit} from './pagination'

export default class Interactor {

  editCellNameP: Bacon.Property
  filesP: Bacon.Property
  forcedScrollTopP: Bacon.Property
  listHeightP: Bacon.Property
  loadingS: Bacon.Stream
  notesPathS: Bacon.Stream
  openFileS: Bacon.Stream
  paginationP: Bacon.Property
  rowHeightP: Bacon.Property
  saveEditedCellContentS: Bacon.Stream
  selectedPathS: Bacon.Stream
  sifterResultP: Bacon.Property

  constructor (viewCtrl: ViewCtrlType, pathWatcherFactory: PathWatcherFactoryType, service: ServiceType) {
    this.loadingS = viewCtrl.sessionStartS
    this.openFileS = viewCtrl.keyEnterS
    this.saveEditedCellContentS = viewCtrl.saveEditedCellContentS

    this.notesPathS = viewCtrl.sessionStartS
      .map(({rootPath}) => {
        return NotesPath(rootPath)
      })

    const pathWatcherP = Bacon
      .combineTemplate({
        req: viewCtrl.sessionStartS,
        notesPath: this.notesPathS
      })
      .map((t: {req: SessionType, notesPath: NotesPathType}) => {
        const notesFileFilter = new NotesFileFilter(t.req.rootPath, {
          ignoredNames: t.req.ignoredNames,
          excludeVcsIgnoredPaths: t.req.excludeVcsIgnoredPaths
        })
        return pathWatcherFactory.watch(t.notesPath, notesFileFilter)
      })

    const sifterP = pathWatcherP.flatMap(pw => pw.sifterP).toProperty()
    const initialPathScanDoneS = pathWatcherP.flatMap(pw => pw.initialScanDoneP)
    const readyS = initialPathScanDoneS.take(1)
    const resetS = viewCtrl.keyEscS.merge(readyS)
    const searchS = resetS.map('').merge(viewCtrl.textInputS).skipDuplicates()

    this.filesP = sifterP.map('.items')

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
          fields: t.fields.map(field => field.filePropName),
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
    const selectedProp = Bacon
      .update(
        {index: undefined, path: undefined},
        [viewCtrl.activePathS, this.filesP, itemsP], (old, path, files, items) => {
          const fileIndex = files.findIndex(file => file.path === path)
          if (fileIndex === -1) return {}

          const newIndex = items.findIndex(item => item.id === fileIndex)
          if (newIndex === -1) return {}

          return {index: newIndex, path: files[fileIndex].path}
        },
        [viewCtrl.keyUpS, this.filesP, itemsP], (old, _, files, items) => {
          // stop at beginning of list; start from end of list if there was no old selected index
          let newIndex = isNaN(old.index) ? items.length : old.index
          newIndex = Math.max(newIndex - 1, 0)
          return {index: newIndex, path: files[items[newIndex].id].path}
        },
        [viewCtrl.keyDownS, this.filesP, itemsP], (old, _, files, items) => {
          // stop at end of list; start from the beginning of list if there was no old selected index
          let newIndex = isNaN(old.index) ? -1 : old.index
          newIndex = Math.min(newIndex + 1, items.length - 1)
          return {index: newIndex, path: files[items[newIndex].id].path}
        },
        [viewCtrl.clickedCellS, this.filesP, itemsP], (old, newIndex, files, items) => {
          const item = items[newIndex]
          if (!item) return old
          return {index: newIndex, path: files[item.id].path}
        },
        [resetS], {},
        [this.filesP.changes(), itemsP], (old, files, items) => {
          if (!old.path) return old

          const fileIndex = files.findIndex(file => file.path === old.path)
          if (fileIndex === -1) return {}

          const newIndex = items.findIndex(item => item.id === fileIndex)
          if (newIndex === -1) return {}

          return {index: newIndex, path: files[fileIndex].path}
        },
        [searchS], {}
      )

    this.selectedPathS = selectedProp.map('.path').changes()

    this.forcedScrollTopP = Bacon
      .update(
        undefined,
        [resetS], 0,
        [searchS], 0,
        [viewCtrl.scrollTopS], undefined,
        [selectedProp.map('.index').changes(), viewCtrl.scrollTopS.toProperty(0), this.listHeightP, this.rowHeightP],
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
        [this.selectedPathS], undefined,
        [this.saveEditedCellContentS.delay(0)], undefined) // delay to have it changed in next tick
  }

}
