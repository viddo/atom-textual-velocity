'use babel'

const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/

export default class Presenter {

  constructor ({viewCtrl, columns}) {
    this.viewCtrl = viewCtrl
    this._columns = columns
    this._columnHeaders = this._columns.map(c => ({
      id: c.id,
      title: c.title,
      sortField: c.field,
      width: c.width
    }))
  }

  presentLoading () {
    this.viewCtrl.displayLoading()
  }

  /**
   * @param {Object} results
   * @param {Array<File>} results.files
   * @param {Object} results.sifterResult see https://github.com/brianreavis/sifter.js#usage
   * @param {Object} results.pagination
   * @param {Number} results.pagination.start
   * @param {Number} results.pagination.limit
   * @param {Number,undefined} results.selectedIndex
   * @param {Number,undefined} selectedIndex
   */
  presentResults (results) {
    const {files, sifterResult, pagination, selectedIndex} = results
    const items = sifterResult.items || []

    this.viewCtrl.displayResults({
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
            cells: this._columns.map(c => c.cellContent(file, results))
          }
        })
    })
  }

  presentSelectedFilePreview (file) {
    this.viewCtrl.displaySelectedItemPreview(file.path)
  }

  presentSelectedFileContent (file) {
    this.viewCtrl.displayItemContent(file.path)
  }

  presentNewFile (file) {
    const path = HAS_FILE_EXT_REGEX.test(file.path) && file.path || `${file.path}.md`
    this.viewCtrl.displayItemContent(path)
  }

}
