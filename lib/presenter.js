'use babel'

export default class Presenter {

  constructor (aViewCtrl) {
    this.viewCtrl = aViewCtrl
  }

  presentLoading () {
    this.viewCtrl.displayLoading()
  }

  presentFilesPreview (files) {
    const filenames = files.map(file => file.path())
    this.viewCtrl.previewFiles(filenames)
  }

}
