/* @flow */

import chokidar from 'chokidar'
import Path from 'path'
import {Task} from 'atom'
import NotesFileFilter from './notes-file-filter'

export default class PathWatcher {

  _chokidarWatch: chokidar
  _pathScanTask: Task

  constructor (dir: string, dispatch: Function) {
    const fileFilter = new NotesFileFilter(dir, {
      exclusions: atom.config.get('textual-velocity.ignoredNames'),
      excludeVcsIgnoredPaths: atom.config.get('textual-velocity.excludeVcsIgnoredPaths')
    })
    const fileActionCreator = type => (filename, stats) => {
      const path = Path.join(dir, filename)
      if (fileFilter.isAccepted(path)) {
        dispatch({
          type: type,
          filename: filename,
          stats: stats
        })
      }
    }
    const defaultChokidarOpts = {
      ignored: 'node_modules',
      persistent: true,
      depth: 0,
      cwd: dir
    }
    const watchOpts = Object.assign({}, defaultChokidarOpts, {ignoreInitial: true}) // initial scan is done by task below
    this._chokidarWatch = chokidar.watch(dir, watchOpts)

    this._pathScanTask = new Task(Path.join(__dirname, 'path-watcher-task.js'), defaultChokidarOpts)
    this._pathScanTask.on('add', fileActionCreator('SCANNED_FILE'))
    this._pathScanTask.on('ready', () => {
      this._pathScanTask.terminate()
      this._chokidarWatch.on('add', fileActionCreator('NEW_FILE'))
      this._chokidarWatch.on('change', fileActionCreator('CHANGED_FILE'))
      this._chokidarWatch.on('unlink', fileActionCreator('REMOVED_FILE'))
    })
    this._pathScanTask.start(dir)
  }

  dispose () {
    this._chokidarWatch.close()
    try {
      this._pathScanTask.terminate()
    } catch (err) {
      // if already terminated
    }
  }
}
