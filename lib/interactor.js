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

  filesProp: Bacon.Property
  forcedScrollTopProp: Bacon.Property
  listHeightProp: Bacon.Property
  loadingStream: Bacon.Stream
  notesPathStream: Bacon.Stream
  openFileStream: Bacon.Stream
  paginationProp: Bacon.Property
  rowHeightProp: Bacon.Property
  selectedIndexProp: Bacon.Property
  sifterResultProp: Bacon.Property

  constructor (viewCtrl: ViewCtrlType, pathWatcherFactory: PathWatcherFactoryType) {
    this.loadingStream = viewCtrl.sessionStartStream
    this.openFileStream = viewCtrl.keyEnterStream

    this.notesPathStream = viewCtrl.sessionStartStream
      .map(({rootPath}) => {
        return NotesPath(rootPath)
      })

    const pathWatcherProp = Bacon
      .combineTemplate({
        req: viewCtrl.sessionStartStream,
        notesPath: this.notesPathStream
      })
      .map(({req, notesPath}) => {
        const notesFileFilter = new NotesFileFilter(req.rootPath, {
          ignoredNames: req.ignoredNames,
          excludeVcsIgnoredPaths: req.excludeVcsIgnoredPaths
        })
        return pathWatcherFactory.watch(notesPath, notesFileFilter)
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
        sifter: this.filesProp
          .debounce(RE_INDEXING_RATE_LIMIT)
          .map((files: Array<NotesFileType>) => {
            return new Sifter(
              files.map(f => ({
                name: f.name,
                content: f.content,
                createdTime: f.createdTime,
                lastUpdatedTime: f.lastUpdatedTime
              })))
          })
      })
      .map(d => {
        // see https://github.com/brianreavis/sifter.js/#searchquery-options for available configuration options
        return d.sifter.search(d.query, {
          fields: ['name', 'content'],
          sort: [
            {field: d.sortField, direction: d.sortDirection},
            {field: '$score', direction: d.sortDirection}
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
        [viewCtrl.clickedRowStream], R.nthArg(-1),
        [resetStream], undefined,
        [searchStream], undefined
      )
      .skipDuplicates()

    this.forcedScrollTopProp = Bacon
      .update(
        undefined,
        [resetStream], 0,
        [searchStream], 0,
        [viewCtrl.scrollTopStream], undefined,
        [this.selectedIndexProp.changes(), viewCtrl.scrollTopStream.toProperty(0), this.listHeightProp, this.rowHeightProp],
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
        [this.listHeightProp.toEventStream(), this.rowHeightProp.toEventStream()], (old, listHeight, rowHeight) => {
          return {
            start: old.start,
            limit: calcPaginationLimit({rowHeight: rowHeight, listHeight: listHeight})
          }
        },
        [scrollTopStream, this.rowHeightProp], (old, scrollTop, rowHeight) => {
          return {
            start: calcPaginationStart({rowHeight: rowHeight, scrollTop: scrollTop}),
            limit: old.limit
          }
        })
      .skipDuplicates()
  }

}
