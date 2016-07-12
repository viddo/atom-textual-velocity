'use babel'

import chokidar from 'chokidar'
import memoize from 'memoize-decorator'
import fs from 'fs'
import Bacon from 'baconjs'
import R from 'ramda'

export default class PathWatcher {

  constructor ({rootPath, File}) {
    this._watch = chokidar.watch(rootPath, {
      ignored: 'node_modules',
      persistent: true,
      cwd: rootPath
    })

    const addFilesStream = this._createFileStream('add', File)
    const changedFileStream = this._createFileStream('change', File).debounce(200)
    const removedFilesStream = Bacon.fromEvent(this._watch, 'unlink')
    const fileContentStream = addFilesStream.flatMap(function (file) {
      return Bacon
        .fromNodeCallback(fs.readFile, file.path, 'utf8')
        .map(data => file.withContent(data))
    })

    this._filesProp = Bacon
      .update(
        [],
        [addFilesStream], (files, file) => {
          files.push(file)
          return files
        },
        [fileContentStream], (files, file) => {
          return files.map(prev => {
            return (file.relPath === prev.relPath
              ? file
              : prev)
          })
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

    // no-op subscriptions, to have their props reflect what's being scanned even though there are no initial side-effects
    this._unsubFiles = this._filesProp.onValue(() => {})
    this._unsubInitialScanDoneProp = this.initialScanDoneProp.onValue(() => {})
  }

  @memoize get initialScanDoneProp () {
    return Bacon.fromEvent(this._watch, 'ready').map(true).toProperty(false)
  }

  get filesProp () {
    return this._filesProp
  }

  dispose () {
    this._unsubInitialScanDoneProp()
    this._unsubFiles()
    this._watch.close()
  }

  _createFileStream (event, File) {
    return Bacon
      .fromEvent(this._watch, event, (relPath, stat) => {
        if (File.accepts(relPath)) {
          return new File(relPath, stat)
        }
      })
      .filter(R.is(Object))
  }

}
