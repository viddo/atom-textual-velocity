'use babel'

import {Task} from 'atom'
import Bacon from 'baconjs'
import R from 'ramda'
import atoms from './atom-streams'

// Coordinates all behavior related to querying project folders, into a list of coherent results
class Projects {

  constructor () {
    this.queryBus = new Bacon.Bus()

    const {openStream, closeStream} = atoms.createProjectsPathsStreams()
    const watchedPathTaskStream = openStream.map(this._createWatchPathTask)
    const newItemsStream = watchedPathTaskStream.flatMap(task => Bacon.fromEvent(task, 'add'))
    const removedItemsStream = watchedPathTaskStream.flatMap(task => Bacon.fromEvent(task, 'unlink'))

    const tasksProp = Bacon.update(
      [],
      [watchedPathTaskStream], this._concat,
      [closeStream], this._removetask
    )
    this._unsubscribeTasks = tasksProp.onEnd(R.forEach(this._disposeTask))

    const allItemsProp = Bacon.update(
      [],
      [newItemsStream], this._concat,
      [removedItemsStream], (items, path) => items.filter(item => item.path !== path),
      [closeStream], (items, path) => items.filter(item => !item.path.startsWith(path))
    )

    const queryStream = this.queryBus.skipDuplicates()
    let queryTask
    const queryResultsStream = Bacon
      .combineAsArray(allItemsProp.map(R.map(R.prop('path'))), queryStream)
      .flatMapLatest(([paths, query]) => {
        if (queryTask) queryTask.terminate()
        queryTask = Task.once(require.resolve('./query-task.js'), paths, query)
        return Bacon.fromEvent(queryTask, 'results')
      })

    this.itemsProp = Bacon.update(
      [],
      [queryStream, allItemsProp], (_, q, allItems) =>
        q === ''
          ? allItems
          : [],
      [queryResultsStream], this._concat,
      [allItemsProp.changes(), queryStream.toProperty()], (items, allItems, q) =>
        q === ''
          ? allItems
          : items
    )
  }

  dispose () {
    this.queryBus.end()
    this._unsubscribeTasks()
    this.queryBus = null
    this.itemsProp = null
  }

  _concat (list, results) {
    return list.concat(results)
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
