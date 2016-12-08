/* @flow */

import Rx from 'rxjs/Rx'
import {Task} from 'atom'
import Path from 'path'
import NotesFileFilter from '../../lib/notes-file-filter'

const pathScannerEpic = (action$: any, store: any) => {
  const dir = atom.config.get('textual-velocity.path')

  const chokidarOpts = {
    ignored: 'node_modules',
    persistent: true,
    depth: 0,
    cwd: dir
  }

  const fileFilter = new NotesFileFilter(dir, {
    exclusions: atom.config.get('textual-velocity.ignoredNames'),
    excludeVcsIgnoredPaths: atom.config.get('textual-velocity.excludeVcsIgnoredPaths')
  })

  const task = new Task(Path.join(__dirname, '..', 'path-scan-task.js'))
  task.off = () => {} // makes task compatible with expected format for Observable.fromEvent
  task.on('task:completed', () => {
    task.terminate()
  })

  return action$
    .filter(action => action.type === 'START_INITIAL_SCAN')
    .switchMap(() => {
      const add$ = Rx
        .Observable.fromEvent(task, 'add')
        .mergeMap((item: {filename: string, stats: FsStatsType}) => {
          const path = Path.join(dir, item.filename)
          return fileFilter.isAccepted(path)
            ? Rx.Observable.of({
              type: 'SCANNED_FILE',
              filename: item.filename,
              stats: item.stats
            })
            : Rx.Observable.empty()
        })

      const initialScanDone$ = Rx
        .Observable.fromEvent(task, 'done')
        .mapTo({type: 'INITIAL_SCAN_DONE'})

      task.start(dir, chokidarOpts)

      return Rx.Observable.merge(add$, initialScanDone$)
    })
    .takeUntil(
      action$
        .filter(action => action.type === 'DISPOSE')
        .map(() => {
          try {
            task.send('dispose')
          } catch (err) {
            // throws error if task is already completed
          }
          task.terminate()
        })
    )
}

export default pathScannerEpic
