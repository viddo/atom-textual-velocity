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

    this.queryBus = new Bacon.Bus()
    const queryStream = this.queryBus.map(R.trim).skipDuplicates()
    const emptyQueryStream = queryStream.filter(R.isEmpty)
    const queryProp = queryStream.toProperty('')
    const queryResultsStream = Bacon.fromEvent(this._task, 'queryResults')

    const addedItemsStream = Bacon.fromEvent(this._task, 'addedItem')
    const removedItemsStream = Bacon.fromEvent(this._task, 'removedItem')
    const allItemsProp = Bacon.update(
      [],
      [addedItemsStream], (items, addedItem) => items.concat(addedItem),
      [removedItemsStream], (items, path) => items.filter(item => item.path !== path)
    )

    this.itemsProp = Bacon.update(
      [],
      [queryResultsStream, allItemsProp], (_, results, allItems) => results.items.map(({id}) => allItems[id]),
      [emptyQueryStream, allItemsProp], R.nthArg(-1),
      [allItemsProp.changes(), queryProp], (items, allItems, q) => R.isEmpty(q) ? allItems : items
    )

    const {openStream, closeStream} = atoms.createProjectsPathsStreams()

    this._disposableValues = new DisposableValues()
    this._disposableValues.add(
      openStream.onValue(path => sendMessageTo(this._task, 'openProjectPath', path)),
      closeStream.onValue(path => sendMessageTo(this._task, 'closeProjectPath', path)),
      queryProp
        .filter(q => q !== '')
        .onValue(q => sendMessageTo(this._task, 'query', q))
    )
  }

  dispose () {
    this._disposableValues.dispose()
    sendMessageTo(this._task, 'dispose')
    this.queryBus.end()
  }
}

export default Project
