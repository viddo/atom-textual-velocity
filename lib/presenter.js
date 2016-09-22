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
  loadingProgressP: Bacon.Property
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

    this.loadingProgressP = int.notesP
      .map(notes => {
        const relPaths = Object.keys(notes)
        return {
          total: relPaths.length,
          read: relPaths
            .reduce((sum, relPath) => {
              if (notes[relPath].content !== undefined) sum++
              return sum
            }, 0)
        }
      })
      .takeWhile(({read, total}) => total === 0 || read < total)
      .mapEnd({})

    const selectedPathP = Bacon
      .combineTemplate({
        notesPath: int.notesPathP,
        relPath: int.selectedRelPathS
      })
      .map(({relPath, notesPath}) => relPath && notesPath.fullPath(relPath))

    this.selectedPathS = selectedPathP.changes()

    this.itemsCountP = int.sifterResultP.map('.total')
    this.searchStrP = int.sifterResultP.map('.query')
    this.sortP = int.sifterResultP.map('.options.sort.0')

    this.rowsS = Bacon
      .combineTemplate({
        columns: columnsP,
        sifterResult: int.sifterResultP,
        notes: int.notesP,
        notesPath: int.notesPathP,
        pagination: int.paginationP,
        selectedRelPath: int.selectedRelPathS.toProperty(undefined),
        editCellName: int.editCellNameP
      })
      .map((searchResult: SearchResultsType) => {
        const {columns, editCellName, notes, notesPath, pagination, selectedRelPath, sifterResult} = searchResult

        const regex = R.path(['tokens', 0, 'regex'], sifterResult)
        const searchMatch = regex && new SearchMatch(regex)

        const rows: Array<RowType> = sifterResult.items
          .slice(pagination.start, pagination.start + pagination.limit)
          .map((item, i) => {
            const relPath = item.id
            const note = notes[relPath]
            const rowSelected = relPath === selectedRelPath
            const contentParams = {
              note: note,
              path: notesPath.fullPath(relPath),
              searchMatch: searchMatch
            }

            return {
              id: note.id,
              relPath: relPath,
              selected: rowSelected,
              cells: columns
                .map(column => {
                  if (rowSelected && column.editCellName && column.editCellName === editCellName) {
                    return {
                      editCellStr: column.editCellStr && column.editCellStr(note) || ''
                    }
                  } else {
                    return {
                      content: column.cellContent(contentParams),
                      editCellName: column.editCellName && column.editCellName
                    }
                  }
                })
            }
          })

        return rows
      })
      .sampledBy(
        Bacon.mergeAll(
          int.paginationP.changes(),
          int.selectedRelPathS,
          int.editCellNameP.changes(),
          int.sifterResultP.toEventStream()))

    this.openPathS = Bacon
      .combineTemplate({
        selectedPath: selectedPathP,
        searchStr: this.searchStrP,
        notesPath: int.notesPathP
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
