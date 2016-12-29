/* @flow */

import {Observable} from 'rxjs'
import {Task} from 'atom'
import Path from 'path'
import NotesFileFilter from '../../lib/notes-file-filter'
import {
  DISPOSE,
  initialScanDone,
  scannedFile,
  START_INITIAL_SCAN
} from '../action-creators'

export default function initialScanEpic (action$: rxjs$Observable<Action>, store: Store<State, Action>) {
  const dir = atom.config.get('textual-velocity.path')

  const fileFilter = new NotesFileFilter(dir, {
    exclusions: atom.config.get('textual-velocity.ignoredNames'),
    excludeVcsIgnoredPaths: atom.config.get('textual-velocity.excludeVcsIgnoredPaths')
  })

  const task = new Task(Path.join(__dirname, '..', 'path-scan-task.js'))
  task.off = () => {} // makes task compatible with expected format for Observable.fromEvent
  const terminateTask = () => {
    try {
      task.send('dispose')
    } catch (err) {
      // throws error if task already is terminated
    }
    task.terminate()
  }

  const startInitialScan$ = action$
    .filter(action => {
      if (action.type === START_INITIAL_SCAN) {
        const chokidarOpts = {
          ignored: 'node_modules',
          persistent: true,
          depth: 0,
          cwd: dir
        }
        task.start(dir, chokidarOpts)
      }
      return false
    })

  const scannedFile$ = Observable
    .fromEventPattern(
      handler => task.on('add', handler),
      terminateTask)
    .map((rawFile: RawFile) => {
      const path = Path.join(dir, rawFile.filename)
      if (fileFilter.isAccepted(path)) {
        const stats = rawFile.stats
        stats.atime = new Date(stats.atime)
        stats.birthtime = new Date(stats.birthtime)
        stats.ctime = new Date(stats.ctime)
        stats.mtime = new Date(stats.mtime)

        return scannedFile(rawFile)
      }
    })
    .filter(action => !!action)

  const initialScanDone$ = Observable
    .fromEvent(task, 'done')
    .do(terminateTask)
    .mapTo(initialScanDone())

  return Observable
    .merge(
      startInitialScan$,
      scannedFile$,
      initialScanDone$
    )
    .takeUntil(
      action$.filter(action => action.type === DISPOSE)
    )
}
