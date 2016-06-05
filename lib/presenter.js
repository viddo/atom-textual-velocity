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
      focusSearchInput: true,
      forcedScrollTop: filter.strChanged ? 0 : NaN,
      paginationStart: filter.start,
      itemsCount: sifterResult.total,
      columns: [
        {title: 'Name', key: 'title', width: 70},
        {title: 'Created', key: 'created_at', width: 15},
        {title: 'Updated', key: 'last_updated_at', width: 15}
      ],
      rows: items
        .slice(filter.start, filter.start + filter.limit)
        .map(item => {
          const file = files[item.id]
          return {
            id: file.id,
            title: file.path,
            created_at: moment(file.createdTime).fromNow(),
            last_updated_at: moment(file.lastUpdatedTime).fromNow()
          }
        })
    })
  }

}
