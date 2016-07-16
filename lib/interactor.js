'use babel'

import Bacon from 'baconjs'
import memoize from 'memoize-decorator'
import R from 'ramda'
import Path from 'path'
import Sifter from 'sifter'
import prepFile from './value-objects/prep-file'
import PathWatcher from './path-watcher'

const RE_INDEXING_RATE_LIMIT = 500 // ms
const HAS_FILE_EXT_REGEX = /\.\w{1,5}$/

export default class Interactor {

  constructor (presenter, overrides = {}) {
    this._presenter = presenter

    this._PathWatcher = overrides.PathWatcher || PathWatcher

    this._searchBus = new Bacon.Bus()
    this._paginationBus = new Bacon.Bus()
    this._selectByIndexBus = new Bacon.Bus()
    this._selectByPathBus = new Bacon.Bus()
    this._selectByOffsetBus = new Bacon.Bus()
    this._openOrCreateItemBus = new Bacon.Bus()
    this._sortFieldBus = new Bacon.Bus()
    this._sortDirectionBus = new Bacon.Bus()
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
    this._req = req

    this._presenter.presentLoading()

    this._pathWatcher = new this._PathWatcher({
      rootPath: req.rootPath,
      File: prepFile(req.rootPath, {ignoredNames: req.ignoredNames, excludeVcsIgnoredPaths: req.excludeVcsIgnoredPaths})
    })

    this._disposeSearchResults = Bacon
      .combineTemplate({
        files: this._pathWatcher.filesProp,
        sifterResult: this._sifterResultProp,
        pagination: this._paginationProp,
        selectedIndex: this._selectedIndexProp
      })
      .sampledBy(
        Bacon.mergeAll(
          this._pathWatcher.initialScanDoneProp,
          this._sifterResultProp,
          this._paginationProp,
          this._selectedIndexProp))
      .onValue(results => {
        this._presenter.presentResults(results)
      })

    this._disposePreview = this
      ._selectedFileProp
      .filter(R.identity)
      .onValue(file => {
        this._presenter.presentSelectedFilePreview(file)
      })

    this._disposeOpenOrCreate = this
      ._selectedFileProp
      .sampledBy(this._openOrCreateItemBus)
      .filter(R.identity)
      .onValue(file => {
        this._presenter.presentSelectedFileContent(file)
      })

    this._disposeOpenOrCreate = Bacon
      .combineTemplate({
        selectedFile: this._selectedFileProp,
        searchStr: this._searchBus
      })
      .sampledBy(this._openOrCreateItemBus)
      .filter(({selectedFile}) => !selectedFile)
      .onValue(({searchStr}) => {
        searchStr = searchStr.trim()
        var filename = searchStr === ''
          ? 'untitled.md'
          : HAS_FILE_EXT_REGEX.test(searchStr)
            ? searchStr
            : `${searchStr}.md`
        const path = Path.join(req.rootPath, filename)
        this._presenter.presentNewFile(path)
      })
  }

  @memoize get _selectedFileProp () {
    return Bacon
      .combineTemplate({
        selectedIndex: this._selectedIndexProp,
        files: this._pathWatcher.filesProp,
        sifterResult: this._sifterResultProp
      })
      .map(({selectedIndex, files, sifterResult}) => {
        const index = R.path(['id'], sifterResult.items[selectedIndex])
        return files[index]
      })
  }

  search (str) {
    this._searchBus.push(str)
  }

  paginate ({start, limit}) {
    this._paginationBus.push({start: start, limit: limit})
  }

  selectByIndex (index) {
    this._selectByIndexBus.push(index)
  }

  selectByPath (path) {
    this._selectByPathBus.push(path)
  }

  selectPrev () {
    this._selectByOffsetBus.push(-1)
  }

  selectNext () {
    this._selectByOffsetBus.push(+1)
  }

  openOrCreateItem () {
    this._openOrCreateItemBus.push(true)
  }

  sortByField (field) {
    this._sortFieldBus.push(field)
  }

  sortDirection (direction) {
    this._sortDirectionBus.push(direction)
  }

  stopSession () {
    this._pathWatcher.dispose()
    this._pathWatcher = null
    this._searchBus.end()
    this._searchBus = null
    this._paginationBus.end()
    this._paginationBus = null
    this._selectByIndexBus.end()
    this._selectByIndexBus = null
    this._selectByPathBus.end()
    this._selectByPathBus = null
    this._selectByOffsetBus.end()
    this._selectByOffsetBus = null
    this._openOrCreateItemBus.end()
    this._openOrCreateItemBus = null
    this._sortFieldBus.end()
    this._sortFieldBus = null
    this._sortDirectionBus.end()
    this._sortDirectionBus = null
    if (this._disposeSearchResults) {
      this._disposeSearchResults()
      this._disposeSearchResults = null
      this._disposeOpenOrCreate()
      this._disposeOpenOrCreate = null
      this._disposePreview()
      this._disposePreview = null
    }
  }

  @memoize get _paginationProp () {
    return Bacon
      .update(
        {start: 0, limit: this._req.paginationLimit},
        [this._paginationBus], R.nthArg(-1),
        [this._searchBus], ({limit}) => ({start: 0, limit: limit})
      )
      .skipDuplicates()
  }

  @memoize get _sifterResultProp () {
    const initialPathScanDoneProp = this._pathWatcher.initialScanDoneProp.delay(RE_INDEXING_RATE_LIMIT)
    const sifterProp = this._pathWatcher.filesProp
      .debounce(RE_INDEXING_RATE_LIMIT)
      .map(files => {
        return new Sifter(
          files.map(f => ({
            name: f.name,
            content: f.content,
            createdTime: f.createdTime,
            lastUpdatedTime: f.lastUpdatedTime
          })))
      })

    return Bacon
      .combineTemplate({
        sifter: sifterProp,
        sortField: this._sortFieldBus.toProperty(this._req.sortField),
        sortDirection: this._sortDirectionBus.toProperty(this._req.sortDirection),
        searchStr: this._searchBus.skipDuplicates().toProperty(''),
        initialPathScanDone: initialPathScanDoneProp // not really used, just to trigger initial search
      })
      .filter('.initialPathScanDone')
      .map(d => {
        // see https://github.com/brianreavis/sifter.js/#searchquery-options for available configuration options
        return d.sifter.search(d.searchStr, {
          fields: ['name', 'content'],
          sort: [
            {field: d.sortField, direction: d.sortDirection},
            {field: '$score', direction: d.sortDirection}
          ],
          conjunction: 'and'
        })
      })
      .toEventStream() // to avoid initial property value from trigger subscribers directly
      .skipWhile(initialPathScanDoneProp.not())
      .toProperty()
  }

  @memoize get _selectedIndexProp () {
    return Bacon
      .update(undefined,
        [this._searchBus], R.always(undefined),
        [this._sortFieldBus], R.always(undefined),
        [this._sortDirectionBus], R.always(undefined),
        [this._selectByIndexBus], R.nthArg(-1),
        [this._selectByPathBus.skipDuplicates(), this._pathWatcher.filesProp, this._sifterResultProp], (oldIndex, path, files, {items}) => {
          let index = files.findIndex(file => file.path === path)
          if (index !== -1) {
            index = items.findIndex(item => item.id === index)
            if (index !== -1) {
              return index
            }
          }
        },
        [this._selectByOffsetBus, this._sifterResultProp.map('.total')], (oldIndex, offset, itemsCount) => {
          return offset > 0
            ? Math.min((isNaN(oldIndex) ? -1 : oldIndex) + 1, itemsCount - 1) // "down", start from beginning and stop at the end of list
            : Math.max((isNaN(oldIndex) ? itemsCount : oldIndex) - 1, 0) // "up", start from end and stop at beginning of list
        })
      .skipDuplicates()
  }

}
