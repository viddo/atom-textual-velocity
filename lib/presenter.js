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
   * @param {Boolean} res.focusSearchInput
   */
  presentResults ({filter, files, sifterResult}) {
    const items = sifterResult.items || []

    this.viewCtrl.displayResults({
      focusSearchInput: !filter.strChanged,
      forcedScrollTop: filter.strChanged ? 0 : NaN,
      paginationStart: filter.start,
      sort: sifterResult.options.sort[0],
      itemsCount: sifterResult.total,
      columns: [
        {title: 'Summary', key: 'title', sortField: 'name', width: 70, renderCell: row => row.title + ' - ' + row.content.slice(0, 100)},
        {title: 'Created', key: 'created_at', sortField: 'createdTime', width: 15, renderCell: row => row.created_at},
        {title: 'Updated', key: 'last_updated_at', sortField: 'lastUpdatedTime', width: 15, renderCell: row => row.last_updated_at}
      ],
      rows: items
        .slice(filter.start, filter.start + filter.limit)
        .map(item => {
          const file = files[item.id]
          return {
            id: file.id,
            title: file.path,
            content: file.content || '',
            created_at: moment(file.createdTime).fromNow(),
            last_updated_at: moment(file.lastUpdatedTime).fromNow()
          }
        })
    })
  }

}
