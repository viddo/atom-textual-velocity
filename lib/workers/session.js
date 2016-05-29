'use babel'

import Bacon from 'baconjs'
import R from 'ramda'
import Sifter from 'sifter'

export default class Session {

  constructor ({initialScanDoneProp, filesProp, sortField = 'name', sortDirection = 'desc'}) {
    this._initialScanDoneProp = initialScanDoneProp
    this._searchStrBus = new Bacon.Bus()
    this._sortFieldBus = new Bacon.Bus()
    this._sortDirectionBus = new Bacon.Bus()

    this._sifterProp = filesProp
      .debounce(500) // avoid reindexing on every little file change
      .map(files => {
        return new Sifter(
          files.map(f => { return {name: f.name(), content: f.content()} })
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
    const indexingDoneStream = this._initialScanDoneProp
      .changes() // to only get eventual event _after_ this stream is created, the initial 'false' is of no interest here
      .filter(R.identity) // only pass true
      .merge(
        this._sifterProp
          .takeWhile(this._initialScanDoneProp.not()) // "takes values while the value of a property holds true, and then ends."
          .changes())
    return this._filteredResultsProp
      .sampledBy(indexingDoneStream)
      .onValue(callback)
  }

  dispose () {
    this._searchStrBus.end()
    this._sortFieldBus.end()
    this._sortDirectionBus
  }

}
