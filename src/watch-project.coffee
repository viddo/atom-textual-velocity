Chokidar = require 'chokidar'
FS = require 'fs'
Path = require 'path'

module.exports = (projectPath, ignored, emit) ->
  watcher = Chokidar.watch '.', {
    cwd: projectPath
    ignored: ignored
    persistent: true
  }

  ['add', 'change', 'unlink'].forEach (name) ->
    watcher.on name, (relPath) ->
      emitEvent = (stats) ->
        emit name, {
          relPath: relPath
          projectPath: projectPath
          stats: stats
        }
      if name is 'unlink'
        emitEvent()
      else
        FS.stat Path.join(projectPath, relPath), (error, stats) ->
          emitEvent(stats) unless error

  return watcher
