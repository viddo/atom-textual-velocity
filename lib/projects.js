'use babel'

import {Task} from 'atom'
import Bacon from 'baconjs'
import R from 'ramda'
import atoms from './atom-streams'

class Projects {

  constructor () {
    this._tasks = {}

    this.searchBus = new Bacon.Bus()
    const searchProp = this.searchBus.toProperty('')
    this.matchedItemsProp = Bacon.combineWith(searchProp, this._createItemsProp(), this._filterItemsBySearch)
  }

  _filterItemsBySearch (searchStr, items) {
    return searchStr
      ? items.filter(item =>
          item.relPath.toLowerCase().search(searchStr.toLowerCase()) !== -1
        )
      : items
  }

  _createItemsProp () {
    const {openStream, closeStream} = atoms.createProjectsPathsStreams()
    const watchPathsStream = openStream.map(path => this._createWatchPathTask(path))
    const addItemsStream = watchPathsStream.flatMap(task => Bacon.fromEvent(task, 'add'))
    const removeItemsStream = watchPathsStream.flatMap(task => Bacon.fromEvent(task, 'unlink'))
    const closeProjectsStream = closeStream.map(path => this._destroyWatchPathTask(path))

    return Bacon.update([],
      [addItemsStream], R.flip(R.invoker(1, 'concat')),
      [removeItemsStream], (items, item) =>
        items.filter(R.compose(R.not, R.eqProps('relPath', item, R.__))),
      [closeProjectsStream], (items, item) =>
        items.filter(R.compose(R.not, R.eqProps('projectPath', item, R.__)))
    )
  }

  _createWatchPathTask (path) {
    const task = new Task(require.resolve('./watch-project-task.js'))
    this._tasks[path] = task
    task.projectPath = path // projectPath to match lib/atom/watch-project-task definition
    task.start(path, atom.config.get('core.ignoredNames'), atom.config.get('core.excludeVcsIgnoredPaths'))
    return task
  }

  _destroyWatchPathTask (path) {
    const task = this._tasks[path]
    task.send('dispose')
    return task
  }

  dispose () {
    for (let path in this._tasks) {
      this._destroyWatchPathTask(path)
    }

    this._tasks = null
    this.matchedItemsProp = null
  }
}

export default Projects
