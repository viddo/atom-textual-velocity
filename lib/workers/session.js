'use babel'

import Bacon from 'baconjs'
import R from 'ramda'
import Sifter from 'sifter'

const RE_INDEXING_RATE_LIMIT = 500 // ms

export default class Session {

  constructor ({initialPathScanDoneProp, filesProp, sortField = 'name', sortDirection = 'desc'}) {
    this._initialPathScanDoneProp = initialPathScanDoneProp
    this._searchStrBus = new Bacon.Bus()
    this._sortFieldBus = new Bacon.Bus()
    this._sortDirectionBus = new Bacon.Bus()

    this._sifterProp = filesProp
      .debounce(RE_INDEXING_RATE_LIMIT)
      .map(files => {
        return new Sifter(
          files.map(f => { return {name: f.name, content: f.content} })
        )
      })

    this._sifterResultProp = Bacon
      .combineTemplate({
        sifter: this._sifterProp.startWith(new Sifter([])),
        searchStr: this._searchStrBus.toProperty(''),
        sortField: this._sortFieldBus.toProperty(sortField),
        sortDirection: this._sortDirectionBus.toProperty(sortDirection)
      }).map(d => {
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
     * @param {Object} res.sifterResult - see https://github.com/brianreavis/sifter.js#usage
     */
    this._filteredResultsProp = Bacon.combineTemplate({
      files: filesProp,
      sifterResult: this._sifterResultProp
    })
  }

  /**
   * @param {Session~filteredResultsProp} callback
   * @return {Function} unsubscribe function
   */

  onResults (callback) {
    // Do not trigger results until the files are debounced
    return this._filteredResultsProp
      .sampledBy(
        Bacon.mergeAll(
          this._searchStrBus.skipDuplicates().toProperty(),
          this._initialPathScanDoneProp.delay(RE_INDEXING_RATE_LIMIT).filter(R.identity).take(1)
        )
      )
      .onValue(callback)
  }

  search (aString) {
    this._searchStrBus.push(aString)
  }

  dispose () {
    this._searchStrBus.end()
    this._sortFieldBus.end()
    this._sortDirectionBus
  }

}
