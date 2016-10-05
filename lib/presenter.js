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
  notesP: Bacon.Property
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
    this.notesP = int.notesP
    this.rowHeightP = int.rowHeightP

    this.loadingProgressP = int.notesP
      .map(notes => {
        const filenames = Object.keys(notes)
        return {
          total: filenames.length,
          ready: filenames
            .reduce((sum, filename) => {
              if (notes[filename].ready) sum++
              return sum
            }, 0)
        }
      })
      .takeWhile(({ready, total}) => total === 0 || ready < total)
      .mapEnd({})

    const selectedPathP = Bacon
      .combineTemplate({
        notesPath: int.notesPathP,
        filename: int.selectedFilenameS
      })
      .map(({filename, notesPath}) => filename && notesPath.fullPath(filename))

    this.selectedPathS = selectedPathP.changes()

    this.itemsCountP = int.sifterResultP.map('.total')
    this.searchStrP = int.searchStrS
    this.sortP = int.sifterResultP.map('.options.sort.0')

    this.rowsS = Bacon
      .combineTemplate({
        columns: columnsP,
        sifterResult: int.sifterResultP,
        notes: int.notesP,
        notesPath: int.notesPathP,
        pagination: int.paginationP,
        selectedFilename: int.selectedFilenameS.toProperty(undefined),
        editCellName: int.editCellNameP
      })
      .map((searchResult: SearchResultsType) => {
        const {columns, editCellName, notes, notesPath, pagination, selectedFilename, sifterResult} = searchResult

        const regex = R.path(['tokens', 0, 'regex'], sifterResult)
        const searchMatch = regex && new SearchMatch(regex)

        const rows: Array<RowType> = sifterResult.items
          .slice(pagination.start, pagination.start + pagination.limit)
          .map((item, i) => {
            const filename = item.id
            const note = notes[filename]
            const rowSelected = filename === selectedFilename
            const contentParams = {
              note: note,
              path: notesPath.fullPath(filename),
              searchMatch: searchMatch
            }

            return {
              id: note.id,
              filename: filename,
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
          int.selectedFilenameS,
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
        const filename = HAS_FILE_EXT_REGEX.test(searchStr)
          ? searchStr
          : `${searchStr}.${atom.config.get('textual-velocity.defaultExt').replace(/^\./, '')}`
        return notesPath.fullPath(filename)
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
