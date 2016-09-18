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
  saveEditedCellContentS: Bacon.Stream
  selectedPathS: Bacon.Stream
  rowHeightP: Bacon.Property
  rowsS: Bacon.Stream
  searchStrP: Bacon.Property
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

    this.itemsCountP = int.sifterResultP.map('.total')
    this.searchStrP = int.sifterResultP.map('.query')
    this.sortP = int.sifterResultP.map('.options.sort.0')

    this.rowsS = Bacon
      .combineTemplate({
        columns: columnsP,
        sifterResult: int.sifterResultP,
        files: int.filesP,
        pagination: int.paginationP,
        selectedIndex: int.selectedIndexP,
        editCellName: int.editCellNameP
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
          int.paginationP.changes(),
          int.selectedIndexP.changes(),
          int.editCellNameP.changes(),
          int.sifterResultP.toEventStream()))

    this.selectedPathS = Bacon
      .combineTemplate({
        selectedIndex: int.selectedIndexP,
        files: int.filesP,
        sifterResult: int.sifterResultP
      })
      .map(({selectedIndex, files, sifterResult}) => {
        const index = R.path(['id'], sifterResult.items[selectedIndex])
        const file = files[index]
        return file && file.path
      })
      .changes()

    this.openPathS = Bacon
      .combineTemplate({
        selectedPath: this.selectedPathS,
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
        path: this.selectedPathS,
        editCellName: int.editCellNameP,
        str: int.saveEditedCellContentS
      })
      .sampledBy(int.saveEditedCellContentS)
  }

}
