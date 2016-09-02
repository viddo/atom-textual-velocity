/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'

const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/

export default class Presenter {

  columnHeadersProp: Bacon.Property
  forcedScrollTopProp: Bacon.Property
  itemsCountProp: Bacon.Property
  listHeightProp: Bacon.Property
  loadingStream: Bacon.Stream
  openPathStream: Bacon.Stream
  paginationProp: Bacon.Property
  selectedPathStream: Bacon.Stream
  rowHeightProp: Bacon.Property
  rowsStream: Bacon.Stream
  searchStrProp: Bacon.Property
  sortProp: Bacon.Property

  constructor (int: InteractorType, columns: Array<ColumnType>) {
    const columnHeaders: Array<ColumnHeaderType> = columns.map(c => ({
      title: c.title,
      sortField: c.field,
      width: c.width
    }))
    this.columnHeadersProp = Bacon.constant(columnHeaders)

    this.forcedScrollTopProp = int.forcedScrollTopProp
    this.loadingStream = int.loadingStream
    this.paginationProp = int.paginationProp
    this.listHeightProp = int.listHeightProp
    this.rowHeightProp = int.rowHeightProp

    this.itemsCountProp = int.sifterResultProp.map('.total')
    this.searchStrProp = int.sifterResultProp.map('.query')
    this.sortProp = int.sifterResultProp.map('.options.sort.0')

    this.rowsStream = Bacon
      .combineTemplate({
        sifterResult: int.sifterResultProp,
        files: int.filesProp,
        pagination: int.paginationProp,
        selectedIndex: int.selectedIndexProp
      })
      .map((searchResult: SearchResultsType) => {
        const {files, pagination} = searchResult
        return searchResult.sifterResult.items
          .slice(pagination.start, pagination.start + pagination.limit)
          .map((item, i) => {
            const file = files[item.id]
            const index = pagination.start + i
            return {
              id: file.id,
              index: index,
              selected: index === searchResult.selectedIndex,
              cells: columns.map(c => c.cellContent(file, searchResult))
            }
          })
      })
      .sampledBy(
        Bacon.mergeAll(
          int.paginationProp.changes(),
          int.selectedIndexProp.changes(),
          int.sifterResultProp.toEventStream()))

    this.selectedPathStream = Bacon
      .combineTemplate({
        selectedIndex: int.selectedIndexProp,
        files: int.filesProp,
        sifterResult: int.sifterResultProp
      })
      .map(({selectedIndex, files, sifterResult}) => {
        const index = R.path(['id'], sifterResult.items[selectedIndex])
        const file = files[index]
        return file && file.path
      })
      .changes()

    this.openPathStream = Bacon
      .combineTemplate({
        selectedPath: this.selectedPathStream,
        searchStr: this.searchStrProp,
        notesPath: int.notesPathStream
      })
      .sampledBy(int.openFileStream)
      .map(({selectedPath, searchStr, notesPath}) => {
        if (selectedPath) return selectedPath

        searchStr = searchStr.trim() || 'untitled'
        const relPath = HAS_FILE_EXT_REGEX.test(searchStr) && searchStr || `${searchStr}.md`
        return notesPath.fullPath(relPath)
      })
  }

}
