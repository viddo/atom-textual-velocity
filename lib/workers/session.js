'use babel'

import Bacon from 'baconjs'
import R from 'ramda'
import Sifter from 'sifter'

const RE_INDEXING_RATE_LIMIT = 500 // ms

export default class Session {

  constructor ({initialPathScanDoneProp, filesProp, paginationLimit, sortField = 'name', sortDirection = 'desc'}) {
    this._filterBus = new Bacon.Bus()
    this._sortFieldBus = new Bacon.Bus()
    this._sortDirectionBus = new Bacon.Bus()
    this._paginationBus = new Bacon.Bus()

    this._initialPathScanDoneProp = initialPathScanDoneProp.delay(RE_INDEXING_RATE_LIMIT)

    const newSifter = files => (
      new Sifter(
        files.map(f => ({
          name: f.name,
          content: f.content}))))

    this._sifterProp = Bacon.update(
      new Sifter([]),
      [filesProp.debounce(RE_INDEXING_RATE_LIMIT).changes()], (_, files) => newSifter(files),
      [this._initialPathScanDoneProp.changes(), filesProp], (_, __, files) => newSifter(files)
    )

    this._filterProp = Bacon
      .update(
        ({
          str: '',
          strChanged: true,
          start: 0,
          limit: paginationLimit
        }),
        [this._filterBus.skipDuplicates(R.equals)], (prev, filter) => {
          filter.strChanged = filter.str !== prev.str
          return filter
        }
      )
      .skipDuplicates(R.equals)

    this._sifterResultProp = Bacon
      .combineTemplate({
        sifter: this._sifterProp,
        sortField: this._sortFieldBus.toProperty(sortField),
        sortDirection: this._sortDirectionBus.toProperty(sortDirection),
        searchStr: this._filterProp.map('.str')
      })
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

    /**
     * @callback Session~filteredResultsProp
     * @param {Object} res
     * @param {Array<File>} res.files
     * @param {Object} res.filter
     * @param {Object} res.filter.str - search string
     * @param {Object} res.filter.start - pagination start
     * @param {Object} res.filter.end - pagination end
     * @param {Object} res.sifterResult - see https://github.com/brianreavis/sifter.js#usage
     */
    this._filteredResultsStream = Bacon
      .combineTemplate({
        files: filesProp,
        filter: this._filterProp,
        sifterResult: this._sifterResultProp
      })
      .changes() // to avoid initial property value from trigger subscribers directly
  }

  /**
   * @param {Session~filteredResultsProp} callback
   */
  onInitialResults (callback) {
    return this._filteredResultsStream
      .sampledBy(this._initialPathScanDoneProp)
      .subscribe(event => {
        if (event.hasValue()) {
          callback(event.value())
          return Bacon.noMore
        }
      })
  }

  /**
   * @param {Session~filteredResultsProp} callback
   */
  onSearchResults (callback) {
    return this._filteredResultsStream
      .sampledBy(this._filterProp)
      .onValue(callback)
  }

  /**
   * @param {Object} filter
   * @param {String=} filter.str - search string
   * @param {Number=} filter.start - pagination start
   * @param {Number=} filter.limit - pagination limit
   */
  search (filter) {
    this._filterBus.push(filter)
  }

  dispose () {
    this._filterBus.end()
    this._sortFieldBus.end()
    this._sortDirectionBus
  }

}
