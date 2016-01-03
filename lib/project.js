'use babel'

import {Task} from 'atom'
import Bacon from 'baconjs'
import R from 'ramda'
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

    const addedItemsStream = Bacon.fromEvent(this._task, 'addedItem')
    const removedItemsStream = Bacon.fromEvent(this._task, 'removedItem')
    const {closeStream} = atoms.createProjectsPathsStreams()
    const allItemsProp = Bacon.update(
      [],
      [addedItemsStream], (items, addedItem) => items.concat(addedItem),
      [removedItemsStream], (items, path) => items.filter(item => item.path !== path)
    )

    this.queryBus = new Bacon.Bus()
    const queryStream = this.queryBus.map(R.trim).skipDuplicates()
    const queryResultsStream = Bacon.fromEvent(this._task, 'queryResults')
    this.itemsProp = Bacon.combineWith(queryResultsStream, allItemsProp, (results, allItems) =>
      results.items.map(({id}) => allItems[id])
    )

    this._disposableValues = new DisposableValues(
      closeStream.onValue(path => sendMessageTo(this._task, 'closeProjectPath', path)),
      queryStream.onValue(q => sendMessageTo(this._task, 'query', q))
    )
  }

  dispose () {
    this._disposableValues.dispose()
    sendMessageTo(this._task, 'dispose')
    this.queryBus.end()
  }
}

export default Project
