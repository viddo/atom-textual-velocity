'use babel'

import R from 'ramda'
import Bacon from 'baconjs'
import * as atoms from './atom-streams'
import PathsWatcher from './paths-watcher'

// Coordinates all behavior related to querying project folders, into a list of coherent results
class Project {

  constructor () {
    this.queryBus = new Bacon.Bus()

    this._pathsWatcher = new PathsWatcher({
      openProjectPathStream: atoms.createOpenProjectStream().map(path => {
        return {
          path: path,
          ignoredNames: atom.config.get('core.ignoredNames'),
          excludeVcsIgnoredPaths: !atom.config.get('core.excludeVcsIgnoredPaths')
        }
      }),

      closeProjectPathStream: atoms.createCloseProjectStream(),

      // Pagination; send immediately to avoid UI flicker
      paginateLastQueryStream: this.queryBus
        .skipDuplicates(R.allPass([
          R.eqProps('paginationOffset'),
          R.eqProps('paginationSize')
        ])),

      // Search; debounce to avoid doing unncessary query events while still typing
      queryStream: this.queryBus
        .skipDuplicates(R.eqProps('searchStr'))
        .debounce(50)
    })

    this.resultsProp = this._pathsWatcher.resultsStream
      .map(r => {
        if (r.regexpStr) {
          let m = r.regexpStr.match(/\/(.*)\/(.*)?/)
          r.regexp = new RegExp(m[1], m[2] || '')
        }
        return r
      })
      .toProperty({
        searchStr: '',
        paginationOffset: 0,
        total: 0,
        items: [],
        regexp: undefined
      })
  }

  dispose () {
    this.queryBus.end()
    this._pathsWatcher.dispose()
  }
}

export default Project
