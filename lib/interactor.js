'use babel'

import Bacon from 'baconjs'
import prepFile from './value-objects/prep-file'
import PathWatcher from './workers/path-watcher'
import Session from './workers/session'

export default class Interactor {

  constructor (presenter, overrides = {}) {
    this._presenter = presenter

    this._PathWatcher = overrides.PathWatcher || PathWatcher
    this._Session = overrides.Session || Session

    this._selectBus = new Bacon.Bus()
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
    this._presenter.presentLoading()

    this._pathWatcher = new this._PathWatcher({
      rootPath: req.rootPath,
      File: prepFile(req.rootPath, {ignoredNames: req.ignoredNames, excludeVcsIgnoredPaths: req.excludeVcsIgnoredPaths})
    })
    const filesProp = this._pathWatcher.filesProp()
    const initialPathScanDoneProp = this._pathWatcher.initialScanDoneProp()

    this._session = new this._Session({
      initialPathScanDoneProp: initialPathScanDoneProp,
      filesProp: filesProp,
      sortField: req.sortField,
      sortDirection: req.sortDirection,
      paginationLimit: req.paginationLimit
    })

    this._session.onInitialResults(res => { // only triggered once, so no need to dispose
      this._presenter.presentResults(res)
    })

    this._disposeSearchResults = Bacon
      .combineTemplate({
        searchResults: this._session.searchResultsProp,
        selectedIndex: this._selectBus.toProperty(undefined)
      })
      .onValue(({searchResults, selectedIndex}) => {
        this._presenter.presentResults(searchResults, selectedIndex)
      })
  }

  search (str) {
    this._session.search({str: str, start: 0})
    this._selectBus.push(undefined)
  }

  paginate ({start, limit}) {
    this._session.search({start: start, limit: limit})
  }

  selectByIndex (index) {
    this._selectBus.push(index)
  }

  sortByField (field) {
    this._session.sortByField(field)
    this._selectBus.push(undefined)
  }

  changeSortDirection () {
    this._session.changeSortDirection()
    this._selectBus.push(undefined)
  }

  stopSession () {
    this._session.dispose()
    this._session = null
    this._pathWatcher.dispose()
    this._pathWatcher = null
    this._selectBus.end()
    this._selectBus = null
    this._disposeSearchResults()
    this._disposeSearchResults = null
  }

}
