/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import SearchMatch from './search-match'

const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/

export default class Presenter {

  columnHeadersProp: Bacon.Property
  forcedScrollTopProp: Bacon.Property
  itemsCountProp: Bacon.Property
  listHeightProp: Bacon.Property
  loadingStream: Bacon.Stream
  openPathStream: Bacon.Stream
  paginationProp: Bacon.Property
  saveEditedCellContentStream: Bacon.Stream
  selectedPathStream: Bacon.Stream
  rowHeightProp: Bacon.Property
  rowsStream: Bacon.Stream
  searchStrProp: Bacon.Property
  sortProp: Bacon.Property

  constructor (int: InteractorType, columnsProp: Bacon.Property) {
    this.columnHeadersProp = columnsProp
      .map((columns: Array<ColumnType>) => {
        return columns.map(c => ({
          title: c.title,
          sortField: c.sortField,
          width: c.width
        }))
      })

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
        columns: columnsProp,
        sifterResult: int.sifterResultProp,
        files: int.filesProp,
        pagination: int.paginationProp,
        selectedIndex: int.selectedIndexProp,
        editCellName: int.editCellNameProp
      })
      .map((searchResult: SearchResultsType) => {
        const {columns, files, editCellName, pagination, selectedIndex, sifterResult} = searchResult

        const regex = R.path(['tokens', 0, 'regex'], sifterResult)
        const searchMatch = regex && new SearchMatch(regex)

        return sifterResult.items
          .slice(pagination.start, pagination.start + pagination.limit)
          .map((item, i) => {
            const file = files[item.id]
            const index = pagination.start + i
            const rowSelected = index === selectedIndex

            return {
              id: file.id,
              index: index,
              selected: rowSelected,
              cells: columns
                .map(column => {
                  if (rowSelected && column.editCellName && column.editCellName === editCellName) {
                    return {
                      editCellStr: column.editCellStr && column.editCellStr(file) || ''
                    }
                  } else {
                    return {
                      content: column.cellContent(file, searchMatch),
                      editCellName: column.editCellName && column.editCellName
                    }
                  }
                })
            }
          })
      })
      .sampledBy(
        Bacon.mergeAll(
          int.paginationProp.changes(),
          int.selectedIndexProp.changes(),
          int.editCellNameProp.changes(),
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

    this.saveEditedCellContentStream = Bacon
      .combineTemplate({
        path: this.selectedPathStream,
        editCellName: int.editCellNameProp,
        str: int.saveEditedCellContentStream
      })
      .sampledBy(int.saveEditedCellContentStream)
  }

}
