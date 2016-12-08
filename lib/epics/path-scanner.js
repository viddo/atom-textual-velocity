/* @flow */

import Rx from 'rxjs/Rx'
import {Task} from 'atom'
import Path from 'path'

const pathScannerEpic = (action$: any, store: any) => {
  const dir = store.getState().dir
  const chokidarOpts = {
    ignored: 'node_modules',
    persistent: true,
    depth: 0,
    cwd: dir
  }

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
        .map((filename: string, stats: FsStatsType) => ({
          type: 'SCANNED_FILE',
          filename: filename,
          stats: stats
        }))

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
