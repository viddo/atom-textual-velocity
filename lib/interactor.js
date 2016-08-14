'use babel'

import Bacon from 'baconjs'
import R from 'ramda'
import Sifter from 'sifter'
import DisposableValues from './disposable-values'
import NotesPath from './notes-path'
import NotesFileFilter from './notes-file-filter'

const RE_INDEXING_RATE_LIMIT = 500 // ms

export default class Interactor {

  constructor ({presenter, pathWatcherFactory}) {
    this._presenter = presenter
    this._pathWatcherFactory = pathWatcherFactory

    this._disposables = new DisposableValues()
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

    const notesPath = NotesPath(req.rootPath)
    const notesFileFilter = new NotesFileFilter(req.rootPath, {
      ignoredNames: req.ignoredNames,
      excludeVcsIgnoredPaths: req.excludeVcsIgnoredPaths
    })
    const pathWatcher = this._pathWatcherFactory.watch({
      path: notesPath,
      filter: notesFileFilter
    })

    const initialPathScanDoneProp = pathWatcher.initialScanDoneProp().delay(RE_INDEXING_RATE_LIMIT)
    const sifterProp = pathWatcher.filesProp()
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

    const sifterResultProp = Bacon
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

    const selectedIndexProp = Bacon
      .update(undefined,
        [this._searchBus], R.always(undefined),
        [this._sortFieldBus], R.always(undefined),
        [this._sortDirectionBus], R.always(undefined),
        [this._selectByIndexBus], R.nthArg(-1),
        [this._selectByPathBus.skipDuplicates(), pathWatcher.filesProp(), sifterResultProp], (oldIndex, path, files, {items}) => {
          let index = files.findIndex(file => file.path === path)
          if (index !== -1) {
            index = items.findIndex(item => item.id === index)
            if (index !== -1) {
              return index
            }
          }
        },
        [this._selectByOffsetBus, sifterResultProp.map('.total')], (oldIndex, offset, itemsCount) => {
          return offset > 0
            ? Math.min((isNaN(oldIndex) ? -1 : oldIndex) + 1, itemsCount - 1) // "down", start from beginning and stop at the end of list
            : Math.max((isNaN(oldIndex) ? itemsCount : oldIndex) - 1, 0) // "up", start from end and stop at beginning of list
        })
      .skipDuplicates()

    const selectedFileProp = Bacon
      .combineTemplate({
        selectedIndex: selectedIndexProp,
        files: pathWatcher.filesProp(),
        sifterResult: sifterResultProp
      })
      .map(({selectedIndex, files, sifterResult}) => {
        const index = R.path(['id'], sifterResult.items[selectedIndex])
        return files[index]
      })

    const paginationProp = Bacon
      .update(
        {start: 0, limit: this._req.paginationLimit},
        [this._paginationBus], R.nthArg(-1),
        [this._searchBus], ({limit}) => ({start: 0, limit: limit})
      )
      .skipDuplicates()

    this._disposables.add(
      pathWatcher,

      Bacon
        .combineTemplate({
          files: pathWatcher.filesProp(),
          sifterResult: sifterResultProp,
          pagination: paginationProp,
          selectedIndex: selectedIndexProp
        })
        .sampledBy(
          Bacon.mergeAll(
            pathWatcher.initialScanDoneProp(),
            sifterResultProp,
            paginationProp,
            selectedIndexProp))
        .onValue(results => {
          this._presenter.presentResults(results)
        }),

      selectedFileProp
        .filter(R.identity)
        .onValue(file => {
          this._presenter.presentSelectedFilePreview(file)
        }),

      selectedFileProp
        .sampledBy(this._openOrCreateItemBus)
        .filter(R.identity)
        .onValue(file => {
          this._presenter.presentSelectedFileContent(file)
        }),

      Bacon
        .combineTemplate({
          selectedFile: selectedFileProp,
          searchStr: this._searchBus
        })
        .sampledBy(this._openOrCreateItemBus)
        .filter(({selectedFile}) => !selectedFile)
        .onValue(({searchStr}) => {
          const file = notesPath.newFile(searchStr.trim() || 'untitled.md')
          this._presenter.presentNewFile(file)
        })
    ) // end of disposables
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
    this._disposables.dispose()
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
  }

}
