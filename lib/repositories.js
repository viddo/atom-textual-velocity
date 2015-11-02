'use babel'

import Bacon from 'baconjs'
import atoms from './atom-streams'
import {Emitter} from 'atom'
import DisposableValues from './disposable-values'

// Represents a set of repositories that can be queried and return results based on the query.
class Repositories {

  constructor () {
    this._emitter = new Emitter()
    this._repositories = []

    const initialResults = new Map()
    initialResults.count = 0
    initialResults.items = []

    const addRepositoryStream = atoms.createStream(this._emitter, 'on', 'did-add-repository')
    const resultsStream = addRepositoryStream.flatMap(s => atoms.createStream(s, 'onResults'))
    const resultsProp = Bacon.update(initialResults,
      [resultsStream], (results, r) => {
        results.set(r.uuid, r)
        results.count = 0
        results.items = []
        for (let [, r] of results) {
          results.count += r.count
          results.items = results.items.concat(r.items)
        }
        return results
      }
    )

    this.resultsCountProp = resultsProp.map('.count')
    this.resultsItemsProp = resultsProp.map('.items')

    // Make the results are always active for the lifecycle of this object
    this._disposables = new DisposableValues()
    this._disposables.add(resultsProp.onValue(() => {}))
  }

  add (repository) {
    this._repositories.push(repository)
    this._emitter.emit('did-add-repository', repository)
  }

  query (q) {
    q.searchStr = q.searchStr || ''
    q.pageOffset = q.pageOffset || 0
    q.pageSize = q.pageSize || 0
    this._repositories.forEach(s => s.query(q))
  }

  dispose () {
    this.resultsCountProp = null
    this.resultsItemsProp = null
    this._emitter.dispose()
    this._emitter = null
    this._disposables.dispose()
    this._disposables = null
  }
}

export default Repositories
