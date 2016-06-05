'use babel'

import prepFile from './value-objects/prep-file'
import PathWatcher from './workers/path-watcher'
import Session from './workers/session'

export default class Interactor {

  constructor ({presenter, logger, disposables}, overrides = {}) {
    this._presenter = presenter
    this._logger = logger
    this._disposables = disposables

    this._PathWatcher = overrides.PathWatcher || PathWatcher
    this._Session = overrides.Session || Session
  }

  /**
   * @param {Object} req - request
   * @param {String} req.ignoredNames - e.g. '.git, .DS_Store'
   * @param {String} req.excludeVcsIgnoredPaths - e.g. '.git, .DS_Store'
   * @param {String} req.rootPath
   * @param {String} req.sortField
   * @param {String} req.sortDirection
   * @param {Number} req.paginationLimit
   */
  startSession (req) {
    this._logger.logSessionStart(req)
    this._presenter.presentLoading()

    this._pathWatcher = new this._PathWatcher({
      rootPath: req.rootPath,
      File: prepFile(req.rootPath, {ignoredNames: req.ignoredNames, excludeVcsIgnoredPaths: req.excludeVcsIgnoredPaths})
    })
    const filesProp = this._pathWatcher.filesProp()
    const initialPathScanDoneProp = this._pathWatcher.initialScanDoneProp()
    this._logger.logPathScan({filesProp: filesProp, initialPathScanDoneProp: initialPathScanDoneProp})

    this._session = new this._Session({
      initialPathScanDoneProp: initialPathScanDoneProp,
      filesProp: filesProp,
      sortField: req.sortField,
      sortDirection: req.sortDirection,
      paginationLimit: req.paginationLimit
    })

    this._session.onInitialResults(res => { this._presenter.presentResults(res) }) // only triggered once, so no need to dispose

    this._disposables.add(
      this._session.onSearchResults(res => { this._presenter.presentResults(res) })
    )
  }

  search (str) {
    this._session.search({str: str, start: 0})
  }

  /**
   * @param {Object} pagination
   * @param {Number} pagination.start
   * @param {Number} pagination.limit
   */
  paginate (pagination) {
    this._session.search(pagination)
  }

  stopSession () {
    this._logger.logSessionEnd()
    this._session.dispose()
    this._pathWatcher.dispose()
  }

}
