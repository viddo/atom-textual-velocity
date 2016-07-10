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
   * @param {Object} res - response object from interactor
   * @param {Array<File>} res.filter
   * @param {Array<File>} res.files
   * @param {Object} res.sifterResult see https://github.com/brianreavis/sifter.js#usage
   * @param {Number,undefined} selectedIndex
   */
  presentResults ({filter, files, sifterResult}, selectedIndex) {
    const items = sifterResult.items || []
    const indexStart = filter.start
    const itemsCount = sifterResult.total
    if (!isNaN(selectedIndex)) {
      selectedIndex = Math.max(selectedIndex, 0)
      selectedIndex = Math.min(selectedIndex, itemsCount - 1)
    }

    this.viewCtrl.displayResults({
      str: filter.str,
      forcedScrollTop: filter.strChanged ? 0 : NaN,
      paginationStart: filter.start,
      sort: sifterResult.options.sort[0],
      itemsCount: itemsCount,
      columns: [
        {title: 'Summary', key: 'title', sortField: 'name', width: 70, renderCell: row => row.title + ' - ' + row.content.slice(0, 100)},
        {title: 'Created', key: 'created_at', sortField: 'createdTime', width: 15, renderCell: row => row.created_at},
        {title: 'Updated', key: 'last_updated_at', sortField: 'lastUpdatedTime', width: 15, renderCell: row => row.last_updated_at}
      ],
      rows: items
        .slice(filter.start, indexStart + filter.limit)
        .map((item, i) => {
          const file = files[item.id]
          const index = indexStart + i
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
