chokidar = require 'chokidar'

# @param projectPath {String} Absolute path to be scanned for files -> items
# @param ignoredNames {Array} list of relative file paths to ignore
module.exports = (projectPath, ignoredNames) ->
  terminate = @async()

  ignoredNames = [".git", ".hg", ".svn", ".DS_Store", "._*", "Thumbs.db"]
  ignoredNames = ignoredNames.map (name) -> "#{projectPath}/#{name}"
  watcher = chokidar.watch '.', {
    cwd: "#{projectPath}"
    ignored: ignoredNames
    persistent: true
  }

  watcher.on 'add', (path) ->
    emit('watch:newFile', path)

  watcher.on 'unlink', (path) ->
    console.log 'unlink'

  process.on 'message', ->
    watcher.close()
    terminate()
