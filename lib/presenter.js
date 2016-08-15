/* @flow */

const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/

export default class Presenter {

  viewCtrl: ViewCtrlType
  _columns: Array<ColumnType>
  _columnHeaders: Array<ColumnHeaderType>

  constructor (viewCtrl: ViewCtrlType, columns: Array<ColumnType>) {
    this.viewCtrl = viewCtrl
    this._columns = columns
    this._columnHeaders = columns.map(c => ({
      id: c.id,
      title: c.title,
      sortField: c.field,
      width: c.width
    }))
  }

  presentLoading () {
    this.viewCtrl.displayLoading()
  }

  presentSearchResults (searchResponse: RawSearchResultsType) {
    const {files, sifterResult, pagination, selectedIndex} = searchResponse
    const items = sifterResult.items || []

    this.viewCtrl.displaySearchResults({
      selectedIndex: selectedIndex,
      searchStr: sifterResult.query || '',
      paginationStart: pagination.start,
      itemsCount: sifterResult.total,
      sort: sifterResult.options.sort[0],
      columns: this._columnHeaders,
      rows: items
        .slice(pagination.start, pagination.start + pagination.limit)
        .map((item, i) => {
          const file = files[item.id]
          const index = pagination.start + i
          return {
            id: file.id,
            index: index,
            selected: index === selectedIndex,
            cells: this._columns.map(c => c.cellContent(file, searchResponse))
          }
        })
    })
  }

  presentSelectedFilePreview (file: NotesFileType) {
    this.viewCtrl.displaySelectedItemPreview(file.path)
  }

  presentSelectedFileContent (file: NotesFileType) {
    this.viewCtrl.displayItemContent(file.path)
  }

  presentNewFile (file: NotesFileType) {
    const path = HAS_FILE_EXT_REGEX.test(file.path) && file.path || `${file.path}.md`
    this.viewCtrl.displayItemContent(path)
  }

}
