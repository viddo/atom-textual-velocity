'use babel'

import Bacon from 'baconjs'
import R from 'ramda'
import Sifter from 'sifter'

const RE_INDEXING_RATE_LIMIT = 500 // ms

export default class Session {

  constructor ({initialPathScanDoneProp, filesProp, paginationLimit, sortField = 'name', sortDirection = 'desc'}) {
    this._filterBus = new Bacon.Bus()
    this._sortFieldBus = new Bacon.Bus()
    this._changeSortDirectionBus = new Bacon.Bus()
    this._paginationBus = new Bacon.Bus()

    this._initialPathScanDoneProp = initialPathScanDoneProp.delay(RE_INDEXING_RATE_LIMIT)

    this._sifterProp = filesProp
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

    this._filterProp = Bacon
      .update(
        ({
          str: '',
          strChanged: true,
          start: 0,
          limit: paginationLimit
        }),
        [this._filterBus], (prev, filter) => {
          var newFilter = R.merge(prev, filter)
          newFilter.strChanged = filter.str !== undefined && filter.str !== prev.str
          return newFilter
        }
      )
      .skipDuplicates(R.equals)

    this._sifterResultProp = Bacon
      .combineTemplate({
        sifter: this._sifterProp,
        sortField: this._sortFieldBus.toProperty(sortField),
        sortDirection: this._changeSortDirectionBus.scan(sortDirection, (a, b) => a === 'desc' ? 'asc' : 'desc'),
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

    this._filteredResultsStream = Bacon
      .combineTemplate({
        files: filesProp,
        filter: this._filterProp,
        sifterResult: this._sifterResultProp
      })
      .changes() // to avoid initial property value from trigger subscribers directly
  }

  get searchResultsProp () {
    return this._filteredResultsStream
      .sampledBy(
        Bacon.mergeAll(
          this._initialPathScanDoneProp,
          this._filterProp,
          this._sortFieldBus,
          this._changeSortDirectionBus
        )
      )
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

  sortByField (field) {
    this._sortFieldBus.push(field)
  }

  changeSortDirection () {
    this._changeSortDirectionBus.push(true)
  }

  dispose () {
    this._filterBus.end()
    this._sortFieldBus.end()
    this._changeSortDirectionBus.end()
  }

}
