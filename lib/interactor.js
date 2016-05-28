'use babel'

import Bacon from 'baconjs'
import PathWatcher from './workers/path-watcher'
import prepFile from './value-objects/prep-file'
import DisposableValues from './disposable-values'

export default class Interactor {

  constructor (aPresenter) {
    this.presenter = aPresenter
    this.disposables = new DisposableValues()
  }

  startSession (request) {
    this.presenter.presentLoading()
    console.groupCollapsed(`textual-velocity session: ${request.contextDesc}`)
    console.log(request)

    this.pathWatcher = new PathWatcher({
      rootPath: request.rootPath,
      File: prepFile(request.rootPath, {
        ignoredNames: request.ignoredNames,
        excludeVcsIgnoredPaths: request.excludeVcsIgnoredPaths
      })
    })

    console.groupCollapsed('files')
    const {readyProp, filesProp} = this.pathWatcher

    this.disposables.add(
      filesProp.takeWhile(readyProp.not()).onValue(files => {
        console.log(files[files.length - 1])
      }),

      Bacon.onValues(readyProp, filesProp, (ready, files) => {
        if (ready) {
          console.groupEnd('files')
          console.log(files.length + ' files added')
          this.presenter.presentFilesPreview(files)
        }
      })
    )

    this.disposables.add(this.pathWatcher)
  }

  stopSession () {
    this.disposables.dispose()
    console.groupEnd('session')
  }

}
