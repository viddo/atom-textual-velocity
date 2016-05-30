'use babel'

import moment from 'moment'

export default class Presenter {

  constructor (aViewCtrl) {
    this.viewCtrl = aViewCtrl
  }

  presentLoading () {
    this.viewCtrl.displayLoading()
  }

  presentInitialResults (response) {
    response.focusSearchInput = true
    this.presentResults(response)
  }

  presentSearchResults (response) {
    response.focusSearchInput = false
    this.presentResults(response)
  }

  /**
   * @param {Object} res - response object from interactor
   * @param {Array<File>} res.files
   * @param {Object} res.sifterResult see https://github.com/brianreavis/sifter.js#usage
   * @param {Boolean} res.focusSearchInput
   */
  presentResults ({files, sifterResult, focusSearchInput}) {
    const items = sifterResult.items || []
    this.viewCtrl.displayResults({
      focusSearchInput: focusSearchInput,
      columns: [
        {title: 'Name', key: 'title', width: 70},
        {title: 'Created', key: 'created_at', width: 15},
        {title: 'Updated', key: 'last_updated_at', width: 15}
      ],
      rows: items
        .map(item => {
          const file = files[item.id]
          return {
            id: file.id,
            title: file.path,
            created_at: moment(file.createdTime).fromNow(),
            last_updated_at: moment(file.lastUpdatedTime).fromNow()
          }
        })
        .slice(0, 10)
    })
  }

}
