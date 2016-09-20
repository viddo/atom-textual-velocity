/* @flow */

import Bacon from 'baconjs'
import R from 'ramda'
import SearchMatch from './search-match'

const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/

export default class Presenter {

  columnHeadersP: Bacon.Property
  forcedScrollTopP: Bacon.Property
  itemsCountP: Bacon.Property
  listHeightP: Bacon.Property
  loadingS: Bacon.Stream
  openPathS: Bacon.Stream
  paginationP: Bacon.Property
  rowHeightP: Bacon.Property
  rowsS: Bacon.Stream
  saveEditedCellContentS: Bacon.Stream
  searchStrP: Bacon.Property
  selectedPathS: Bacon.Stream
  sortP: Bacon.Property

  constructor (int: InteractorType, columnsP: Bacon.Property) {
    this.columnHeadersP = columnsP
      .map((columns: Array<ColumnType>) => {
        return columns.map(c => ({
          title: c.title,
          sortField: c.sortField,
          width: c.width
        }))
      })

    this.forcedScrollTopP = int.forcedScrollTopP
    this.loadingS = int.loadingS
    this.paginationP = int.paginationP
    this.listHeightP = int.listHeightP
    this.rowHeightP = int.rowHeightP
    this.selectedPathS = int.selectedPathS

    this.itemsCountP = int.sifterResultP.map('.total')
    this.searchStrP = int.sifterResultP.map('.query')
    this.sortP = int.sifterResultP.map('.options.sort.0')

    const selectedPathP = int.selectedPathS.toProperty(undefined)

    this.rowsS = Bacon
      .combineTemplate({
        columns: columnsP,
        sifterResult: int.sifterResultP,
        files: int.filesP,
        pagination: int.paginationP,
        selectedPath: selectedPathP,
        editCellName: int.editCellNameP
      })
      .map((searchResult: SearchResultsType) => {
        const {columns, files, editCellName, pagination, selectedPath, sifterResult} = searchResult

        const regex = R.path(['tokens', 0, 'regex'], sifterResult)
        const searchMatch = regex && new SearchMatch(regex)

        return sifterResult.items
          .slice(pagination.start, pagination.start + pagination.limit)
          .map((item, i) => {
            const file = files[item.id]
            const index = pagination.start + i
            const rowSelected = file.path === selectedPath

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
          int.paginationP.changes(),
          int.selectedPathS,
          int.editCellNameP.changes(),
          int.sifterResultP.toEventStream()))

    this.openPathS = Bacon
      .combineTemplate({
        selectedPath: selectedPathP,
        searchStr: this.searchStrP,
        notesPath: int.notesPathS
      })
      .sampledBy(int.openFileS)
      .map(({selectedPath, searchStr, notesPath}) => {
        if (selectedPath) return selectedPath

        searchStr = searchStr.trim() || 'untitled'
        const relPath = HAS_FILE_EXT_REGEX.test(searchStr) && searchStr || `${searchStr}.md`
        return notesPath.fullPath(relPath)
      })

    this.saveEditedCellContentS = Bacon
      .combineTemplate({
        path: selectedPathP,
        editCellName: int.editCellNameP,
        str: int.saveEditedCellContentS
      })
      .sampledBy(int.saveEditedCellContentS)
  }

}
