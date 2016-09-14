/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import Sifter from 'sifter'
import NotesPath from './notes-path'
import NotesFileFilter from './notes-file-filter'
import getAdjustedScrollTop from './get-adjusted-scroll-top'
import {start as calcPaginationStart, limit as calcPaginationLimit} from './pagination'

const RE_INDEXING_RATE_LIMIT = 500 // ms

export default class Interactor {

  editCellNameProp: Bacon.Property
  filesProp: Bacon.Property
  forcedScrollTopProp: Bacon.Property
  listHeightProp: Bacon.Property
  loadingStream: Bacon.Stream
  notesPathStream: Bacon.Stream
  openFileStream: Bacon.Stream
  paginationProp: Bacon.Property
  rowHeightProp: Bacon.Property
  saveEditedCellContentStream: Bacon.Stream
  selectedIndexProp: Bacon.Property
  sifterResultProp: Bacon.Property

  constructor (viewCtrl: ViewCtrlType, pathWatcherFactory: PathWatcherFactoryType, service: ServiceType) {
    this.loadingStream = viewCtrl.sessionStartStream
    this.openFileStream = viewCtrl.keyEnterStream
    this.saveEditedCellContentStream = viewCtrl.saveEditedCellContentStream

    this.notesPathStream = viewCtrl.sessionStartStream
      .map(({rootPath}) => {
        return NotesPath(rootPath)
      })

    const pathWatcherProp = Bacon
      .combineTemplate({
        req: viewCtrl.sessionStartStream,
        notesPath: this.notesPathStream
      })
      .map((t: {req: SessionType, notesPath: NotesPathType}) => {
        const notesFileFilter = new NotesFileFilter(t.req.rootPath, {
          ignoredNames: t.req.ignoredNames,
          excludeVcsIgnoredPaths: t.req.excludeVcsIgnoredPaths
        })
        return pathWatcherFactory.watch(t.notesPath, notesFileFilter)
      })

    this.filesProp = pathWatcherProp.flatMap(pw => pw.filesProp).toProperty()

    const initialPathScanDoneStream = pathWatcherProp.flatMap(pw => pw.initialScanDoneProp).delay(RE_INDEXING_RATE_LIMIT)
    const readyStream = initialPathScanDoneStream.take(1)
    const resetStream = viewCtrl.keyEscStream.merge(readyStream)
    const searchStream = resetStream.map('').merge(viewCtrl.textInputStream).skipDuplicates()

    this.sifterResultProp = Bacon
      .combineTemplate({
        sortDirection: viewCtrl.sortDirectionStream,
        sortField: viewCtrl.sortFieldStream,
        query: searchStream,
        fields: service.fieldsProp,
        sifter: Bacon
          .combineTemplate({
            files: this.filesProp,
            fields: service.fieldsProp
          })
          .debounce(RE_INDEXING_RATE_LIMIT)
          .map((t: {files: Array<NotesFileType>, fields: Array<FieldType>}) => {
            return new Sifter(
              t.files.map(file => {
                const raw = {name: file.name}
                t.fields.forEach(field => {
                  raw[field.name] = field.value(file)
                })
                return raw
              }))
          })
      })
      .map((t: {fields: Array<FieldType>, sortDirection: string, sortField: string, query: string, sifter: Sifter}) => {
        // see https://github.com/brianreavis/sifter.js/#searchquery-options for available configuration options
        return t.sifter.search(t.query, {
          fields: t.fields.map(field => field.name),
          sort: [
            {field: t.sortField, direction: t.sortDirection},
            {field: '$score', direction: t.sortDirection}
          ],
          conjunction: 'and'
        })
      })
      .toEventStream()
      .skipWhile(initialPathScanDoneStream.toProperty(false).not())
      .toProperty()

    this.listHeightProp = Bacon
      .update(0,
        [viewCtrl.listHeightStream], R.nthArg(-1),
        [viewCtrl.sessionStartStream.map('.listHeight')], R.nthArg(-1))
      .skipDuplicates()

    this.rowHeightProp = Bacon
      .update(0,
        [viewCtrl.rowHeightStream], R.nthArg(-1),
        [viewCtrl.sessionStartStream.map('.rowHeight')], R.nthArg(-1))
      .skipDuplicates()

    const itemsCountProp = this.sifterResultProp.map('.total')
    this.selectedIndexProp = Bacon
      .update(undefined,
        [viewCtrl.activePathStream, this.filesProp, this.sifterResultProp.map('.items')], (oldIndex, path, files, items) => {
          let index = files.findIndex(file => file.path === path)
          if (index !== -1) {
            index = items.findIndex(item => item.id === index)
            if (index !== -1) {
              return index
            }
          }
        },
        [viewCtrl.keyUpStream, itemsCountProp], (oldIndex, _, itemsCount) => {
          // stop at beginning of list; start from end of list if there was no old selected index
          if (isNaN(oldIndex)) oldIndex = itemsCount
          return Math.max(oldIndex - 1, 0)
        },
        [viewCtrl.keyDownStream, itemsCountProp], (oldIndex, _, itemsCount) => {
          // stop at end of list; start from the beginning of list if there was no old selected index
          if (isNaN(oldIndex)) oldIndex = -1
          return Math.min(oldIndex + 1, itemsCount - 1)
        },
        [viewCtrl.clickedCellStream], R.nthArg(-1),
        [resetStream], undefined,
        [searchStream], undefined
      )
      .skipDuplicates()

    const selectedIndexStream = this.selectedIndexProp.changes()

    this.forcedScrollTopProp = Bacon
      .update(
        undefined,
        [resetStream], 0,
        [searchStream], 0,
        [viewCtrl.scrollTopStream], undefined,
        [selectedIndexStream, viewCtrl.scrollTopStream.toProperty(0), this.listHeightProp, this.rowHeightProp],
          (selectedScrollTop, index, scrollTop, listHeight, rowHeight) => {
            return getAdjustedScrollTop({
              selectedIndex: index,
              scrollTop: Number.isInteger(selectedScrollTop) ? selectedScrollTop : scrollTop,
              rowHeight: rowHeight,
              visibleHeight: listHeight
            })
          },
        [viewCtrl.sessionStartStream], undefined)
      .skipDuplicates()

    const scrollTopStream = this.forcedScrollTopProp.changes().filter(R.is(Number)).merge(viewCtrl.scrollTopStream)

    this.paginationProp = Bacon
      .update(
        {start: 0, limit: 0},
        [searchStream], old => ({start: 0, limit: old.limit}),
        [scrollTopStream, this.rowHeightProp], (old, scrollTop, rowHeight) => {
          return {
            start: calcPaginationStart({rowHeight: rowHeight, scrollTop: scrollTop}),
            limit: old.limit
          }
        },
        [this.listHeightProp.toEventStream(), this.rowHeightProp], (old, listHeight, rowHeight) => {
          return {
            start: old.start,
            limit: calcPaginationLimit({rowHeight: rowHeight, listHeight: listHeight})
          }
        })
      .skipDuplicates()

    this.editCellNameProp = Bacon
      .update(undefined,
        [service.editCellStream], R.nthArg(-1),
        [viewCtrl.dblClickedCellStream.map('.editCellName')], R.nthArg(-1),
        [viewCtrl.abortEditCellStream], undefined,
        [selectedIndexStream], undefined,
        [this.saveEditedCellContentStream.delay(0)], undefined) // delay to have it changed in next tick
  }

}
