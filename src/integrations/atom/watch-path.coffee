Chokidar = require 'chokidar'
FS       = require 'fs'
Path     = require 'path'

module.exports = (rootPath, ignored, emitEvent) ->
  watcher = Chokidar.watch('.', {
    cwd        : rootPath
    ignored    : ignored
    persistent : true
  })

  ['add', 'change'].forEach (eventName) ->
    watcher.on eventName, (relPath) ->
      FS.stat Path.join(rootPath, relPath), (error, stats) ->
        emitEvent(eventName, relPath, stats) unless error

  watcher.on 'unlink', (relPath) ->
    emitEvent('unlink', relPath)

  return watcher
