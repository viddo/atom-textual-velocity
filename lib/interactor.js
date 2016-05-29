'use babel'

import prepFile from './value-objects/prep-file'
import PathWatcher from './workers/path-watcher'
import Session from './workers/session'

export default class Interactor {

  constructor ({presenter, logger, disposables}) {
    this._presenter = presenter
    this._logger = logger
    this._disposables = disposables
  }

  /**
   * @param {Object} req - request
   * @param {String} req.rootPath
   * @param {String} req.sortField
   * @param {String} req.sortDirection
   * @param {String} req.ignoredNames - e.g. '.git, .DS_Store'
   * @param {String} req.excludeVcsIgnoredPaths - e.g. '.git, .DS_Store'
   */
  startSession (req) {
    this._logger.logSessionStart(req)
    this._presenter.presentLoading()

    this._pathWatcher = new PathWatcher({
      rootPath: req.rootPath,
      File: prepFile(req.rootPath, {ignoredNames: req.ignoredNames, excludeVcsIgnoredPaths: req.excludeVcsIgnoredPaths})
    })
    const filesProp = this._pathWatcher.filesProp()
    const initialPathScanDoneProp = this._pathWatcher.initialScanDoneProp()
    this._logger.logPathScan({filesProp: filesProp, initialPathScanDoneProp: initialPathScanDoneProp})

    this._session = new Session({
      initialPathScanDoneProp: initialPathScanDoneProp,
      filesProp: filesProp,
      sortField: req.sortField,
      sortDirection: req.sortDirection
    })

    this._disposables.add(
      this._session.onResults(({files, sifterResult}) => {
        this._presenter.presentFilteredResults({files: files, sifterResult: sifterResult})
      })
    )
  }

  search (aString) {
    this._session.search(aString)
  }

  stopSession () {
    this._logger.logSessionEnd()
    this._session.dispose()
    this._pathWatcher.dispose()
  }

}
