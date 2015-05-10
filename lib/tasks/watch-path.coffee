Chokidar = require 'chokidar'
FS = require 'fs'
Path = require 'path'

# @param {String} projectPath  Absolute path to be scanned for files -> items
# @param ignoredNames {Array} list of relative file paths to ignore
# @emits add { projectPath, relPath, stats }
# @emits change { projectPath, relPath, stats }
# @emits unlink { projectPath, relPath }
module.exports = (projectPath, ignoredNames) ->
  terminate = @async()

  ignoredNames = [".git", ".hg", ".svn", ".DS_Store", "._*", "Thumbs.db"]
  .concat('node_modules')
  ignoredNames = ignoredNames.map (name) -> Path.join(projectPath, name)
  watcher = Chokidar.watch '.', {
    cwd: projectPath
    ignored: ignoredNames
    persistent: true
  }

  ['add', 'change', 'unlink'].forEach (name) ->
    watcher.on name, (path) ->
      emitEvent = (stats) ->
        emit name, {
          relPath: path
          projectPath: projectPath
          stats: stats
        }
      if name is 'unlink'
        emitEvent(stats)
      else
        FS.stat Path.join(projectPath, path), (error, stats) ->
          emitEvent(stats) unless error

  process.on 'message', ->
    watcher.close()
    terminate()
