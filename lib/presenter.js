'use babel'

export default class Presenter {

  constructor (aViewCtrl) {
    this.viewCtrl = aViewCtrl
  }

  presentLoading () {
    this.viewCtrl.displayLoading()
  }

  /**
   * @param {Object} res - response object from interactor
   * @param {Array<File>} res.files
   * @param {Object} res.sifterResult see https://github.com/brianreavis/sifter.js#usage
   */
  presentFilteredResults ({files, sifterResult}) {
    const items = sifterResult.items || []
    this.viewCtrl.displayResults({
      columns: [
        {title: 'Name', key: 'filename', width: 70},
        {title: 'Created', key: 'created_date', width: 15},
        {title: 'Updated', key: 'updated_date', width: 15}
      ],
      rows: items
        .map(item => {
          const file = files[item.id]
          return {
            id: file.id,
            filename: file.path(),
            created_date: '',
            updated_date: ''
          }
        })
        .slice(0, 10)
    })
  }

}
