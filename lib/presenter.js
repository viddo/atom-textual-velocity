'use babel'

import moment from 'moment'

export default class Presenter {

  constructor (aViewCtrl) {
    this.viewCtrl = aViewCtrl
  }

  presentLoading () {
    this.viewCtrl.displayLoading()
  }

  /**
   * @param {Object} results
   * @param {Array<File>} results.files
   * @param {Object} results.sifterResults see https://github.com/brianreavis/sifter.js#usage
   * @param {Object} results.pagination
   * @param {Number} results.pagination.start
   * @param {Number} results.pagination.limit
   * @param {Number,undefined} results.selectedIndex
   * @param {Number,undefined} selectedIndex
   */
  presentResults ({files, sifterResults, pagination, selectedIndex}) {
    const items = sifterResults.items || []
    const itemsCount = sifterResults.total

    this.viewCtrl.displayResults({
      selectedIndex: selectedIndex,
      searchStr: sifterResults.query || '',
      paginationStart: pagination.start,
      itemsCount: itemsCount,
      sort: sifterResults.options.sort[0],
      columns: [
        {title: 'Summary', key: 'title', sortField: 'name', width: 70, renderCell: row => row.title + ' - ' + row.content.slice(0, 100)},
        {title: 'Created', key: 'created_at', sortField: 'createdTime', width: 15, renderCell: row => row.created_at},
        {title: 'Updated', key: 'last_updated_at', sortField: 'lastUpdatedTime', width: 15, renderCell: row => row.last_updated_at}
      ],
      rows: items
        .slice(pagination.start, pagination.start + pagination.limit)
        .map((item, i) => {
          const file = files[item.id]
          const index = pagination.start + i
          return {
            id: file.id,
            index: index,
            selected: index === selectedIndex,
            title: file.path,
            content: file.content || '',
            created_at: moment(file.createdTime).fromNow(),
            last_updated_at: moment(file.lastUpdatedTime).fromNow()
          }
        })
    })
  }

}
