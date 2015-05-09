chokidar = require 'chokidar'

# @param {String} projectPath  Absolute path to be scanned for files -> items
# @param ignoredNames {Array} list of relative file paths to ignore
# @emits add { relPath, stats }
# @emits change { relPath, stats }
# @emits unlink { relPath, stats }
module.exports = (projectPath, ignoredNames) ->
  terminate = @async()

  ignoredNames = [".git", ".hg", ".svn", ".DS_Store", "._*", "Thumbs.db"]
  .concat('node_modules')
  ignoredNames = ignoredNames.map (name) -> "#{projectPath}/#{name}"
  watcher = chokidar.watch '.', {
    cwd: projectPath
    ignored: ignoredNames
    alwaysStat: true
    persistent: true
  }

  ['add', 'change', 'unlink'].forEach (name) ->
    watcher.on name, (path, stats) ->
      emit name, {
        relPath: path
        stats: stats
      }

  process.on 'message', ->
    watcher.close()
    terminate()
