'use babel'

import {Task} from 'atom'
import Bacon from 'baconjs'
import R from 'ramda'
import atoms from './atom-streams'

// Coordinates all behavior related to querying project folders, into a list of coherent results
class Projects {

  constructor () {
    this.queryBus = new Bacon.Bus()
    this._unsubscribes = []

    const {openStream, closeStream} = atoms.createProjectsPathsStreams()
    const watchedPathTaskStream = openStream.map(this._createWatchPathTask)
    const newItemsStream = watchedPathTaskStream.flatMap(task => Bacon.fromEvent(task, 'add'))
    const removedItemsStream = watchedPathTaskStream.flatMap(task => Bacon.fromEvent(task, 'unlink'))

    const tasksProp = Bacon.update(
      [],
      [watchedPathTaskStream], (tasks, task) => tasks.concat(task),
      [closeStream], this._removetask
    )
    this._unsubscribes.push(tasksProp.onEnd(R.forEach(this._disposeTask)))

    const allItemsProp = Bacon.update(
      [],
      [newItemsStream], (items, newItem) => items.concat(newItem),
      [removedItemsStream], (items, path) => items.filter(item => item.path !== path),
      [closeStream], (items, path) => items.filter(item => !item.path.startsWith(path))
    )

    this._queryTask = new Task(require.resolve('./query-task.js'))
    this._queryTask.start()
    this._unsubscribes.push(newItemsStream.onValue(item => this._queryTask.send({type: 'add', item: item})))
    this._unsubscribes.push(removedItemsStream.onValue(path => this._queryTask.send({tyquerpe: 'rm', path: path})))

    const queryStream = this.queryBus.map(R.trim).skipDuplicates()
    const emptyQueryStream = queryStream.filter(R.isEmpty)
    const queryProp = queryStream.toProperty('')
    this._unsubscribes.push(queryProp
      .filter(q => q !== '')
      .onValue(q => this._queryTask.send({type: 'query', query: q})))
    const queryResultsStream = Bacon.fromEvent(this._queryTask, 'results')

    this.itemsProp = Bacon.update(
      [],
      [queryResultsStream, allItemsProp], (_, results, allItems) => results.items.map(({id}) => allItems[id]),
      [emptyQueryStream, allItemsProp], R.nthArg(-1),
      [allItemsProp.changes(), queryProp], (items, allItems, q) => R.isEmpty(q) ? allItems : items
    )
  }

  dispose () {
    this._disposeTask(this._queryTask)
    this._queryTask = null
    this._unsubscribes.forEach(fn => fn())
    this.queryBus.end()
    this.queryBus = null
    this.itemsProp = null
  }

  _createWatchPathTask (path) {
    const task = new Task(require.resolve('./watch-project-folder-task.js'))
    task.projectPath = path // projectPath to match lib/atom/watch-project-task definition
    task.start(path, atom.config.get('core.ignoredNames'), atom.config.get('core.excludeVcsIgnoredPaths'))
    return task
  }

  _removeTask (tasks, path) {
    return tasks.filter(task => {
      if (task.projectPath === path) {
        this._disposeTask(task)
      } else {
        return task
      }
    })
  }

  _disposeTask (task) {
    task.send('dispose')
  }
}

export default Projects
