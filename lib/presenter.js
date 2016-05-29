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
    this.viewCtrl.displayResults({
      columns: [
        {title: 'Name', key: 'filename'},
        {title: 'Created', key: 'created_date'},
        {title: 'Updated', key: 'updated_date'}
      ],
      rows: files.map(file => {
        return {
          filename: file.path(),
          created_date: '',
          updated_date: ''
        }
      }).slice(0, 10)
    })
  }

}
