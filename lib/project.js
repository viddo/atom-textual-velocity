'use babel'

import { Task } from 'atom'
import R from 'ramda'
import Bacon from 'baconjs'
import atoms from './atom-streams'
import DisposableValues from './disposable-values'
import sendMessageTo from './task/send-message-to'

// Coordinates all behavior related to querying project folders, into a list of coherent results
class Project {

  constructor () {
    this._task = new Task(require.resolve('./paths-watcher-task.js'))
    this._task.start(
      atom.project.getPaths(),
      atom.config.get('core.ignoredNames'),
      atom.config.get('core.excludeVcsIgnoredPaths')
    )
    this.resultsProp = Bacon
      .fromEvent(this._task, 'results')
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

    this.queryBus = new Bacon.Bus()

    this._disposableValues = new DisposableValues(
      // Search; debounce to avoid doing unncessary query events while still typing
      this.queryBus
        .skipDuplicates(R.eqProps('searchStr'))
        .debounce(50)
        .onValue(q => sendMessageTo(this._task, 'query', q)),

      // Pagination; send immediately to avoid UI flicker
      this.queryBus
        .skipDuplicates(R.allPass([
          R.eqProps('paginationOffset'),
          R.eqProps('paginationSize')
        ]))
        .onValue(q => sendMessageTo(this._task, 'paginateLastQuery', q)),

      atoms.createProjectsPathsStreams()
        .closeStream
        .onValue(path => sendMessageTo(this._task, 'closeProjectPath', path))
    )
  }

  dispose () {
    sendMessageTo(this._task, 'dispose')
    this._disposableValues.dispose()
    this.queryBus.end()
  }
}

export default Project
