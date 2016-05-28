'use babel'

import chokidar from 'chokidar'
import Bacon from 'baconjs'
import R from 'ramda'

export default class PathWatcher {

  constructor ({rootPath, File}) {
    this._watch = chokidar.watch(rootPath, {
      ignored: 'node_modules',
      persistent: true,
      cwd: rootPath
    })

    const addFilesStream = this._newChokidarEventStream('add', File)
    const changedFileStream = this._newChokidarEventStream('change', File).debounce(200)
    const removedFilesStream = Bacon.fromEvent(this._watch, 'unlink')

    this.readyProp = Bacon.fromEvent(this._watch, 'ready').map(true).toProperty(false)
    this.filesProp = Bacon
      .update(
        [],
        [addFilesStream], (files, file) => {
          files.push(file)
          return files
        },
        [changedFileStream], (files, file) => {
          return files.map(prev => {
            return file.relPath === prev.relPath
              ? file
              : prev
          })
        },
        [removedFilesStream], (files, relPath) => {
          if (!File.accepts(relPath)) return files

          return files.filter(file => file.relPath !== relPath)
        }
      )
  }

  dispose () {
    this._watch.close()
  }

  _newChokidarEventStream (event, File) {
    return Bacon
      .fromEvent(this._watch, event, (relPath, stat) => {
        if (File.accepts(relPath)) {
          return new File(relPath, stat)
        }
      })
      .filter(R.is(Object))
  }

}
