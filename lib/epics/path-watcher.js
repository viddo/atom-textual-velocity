/* @flow */

import {Observable} from 'rxjs'
import Path from 'path'
import {Task} from 'atom'
import * as A from '../action-creators'
import NotesFileFilter from '../notes-file-filter'

export default function pathWatcherEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  const dir = atom.config.get('textual-velocity.path')

  const fileFilter = new NotesFileFilter(dir, {
    exclusions: atom.config.get('textual-velocity.ignoredNames'),
    excludeVcsIgnoredPaths: atom.config.get('textual-velocity.excludeVcsIgnoredPaths')
  })

  const filterAndCreateAction = (actionCreator: (rawFile: RawFile) => Action|void) => (rawFile: RawFile) => {
    const path = Path.join(dir, rawFile.filename)
    if (fileFilter.isAccepted(path)) {
      const {stats} = rawFile
      stats.atime = new Date(stats.atime)
      stats.birthtime = new Date(stats.birthtime)
      stats.ctime = new Date(stats.ctime)
      stats.mtime = new Date(stats.mtime)
      return actionCreator(rawFile)
    }
  }

  const task = new Task(Path.join(__dirname, '..', 'path-watcher-task.js'))
  task.off = () => {} // makes task compatible with expected format for Observable.fromEvent

  return Observable
    .merge(
      action$.filter(action => {
        if (action.type === A.START_INITIAL_SCAN) {
          task.start(dir)
        }
        return false
      }),
      Observable.fromEvent(task, 'add').map(filterAndCreateAction(A.fileAdded)),
      Observable.fromEvent(task, 'change').map(filterAndCreateAction(A.fileChanged)),
      Observable.fromEvent(task, 'unlink').map(A.fileDeleted),
      Observable.fromEvent(task, 'ready').mapTo(A.initialScanDone())
    )
    .filter(action => !!action)
    .takeUntil(
      action$
        .filter(action => action.type === A.DISPOSE)
        .do(() => {
          try {
            task.send('dispose')
          } catch (err) {
            // throws error if task already is terminated
          }
          task.terminate()
        })
    )
}
