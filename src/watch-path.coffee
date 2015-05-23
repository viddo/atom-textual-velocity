Chokidar = require 'chokidar'
FS = require 'fs'
Path = require 'path'

module.exports = (rootPath, ignored, emitEvent) ->
  watcher = Chokidar.watch('.', {
    cwd: rootPath
    ignored: ignored
    persistent: true
  })

  ['add', 'change', 'unlink'].forEach (name) ->
    watcher.on name, (relPath) ->
      if name is 'unlink'
        emitEvent(name, relPath)
      else
        FS.stat Path.join(rootPath, relPath), (error, stats) ->
          emitEvent(name, relPath, stats) unless error

  return watcher
