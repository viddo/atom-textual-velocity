'use babel'

import Chokidar from 'chokidar'
import FS from 'fs'
import Path from 'path'

export default (rootPath, ignored, emitEvent) => {
  let watcher = Chokidar.watch('.', {
    cwd: rootPath,
    ignored: ignored,
    persistent: true
  })

  let events = ['add', 'change']
  events.forEach(eventName => {
    watcher.on(eventName, relPath => {
      FS.stat(Path.join(rootPath, relPath), (error, stats) => {
        if (!error) {
          emitEvent(eventName, relPath, stats)
        }
      })
    })
  })

  watcher.on('unlink', relPath => emitEvent('unlink', relPath))

  return watcher
}
