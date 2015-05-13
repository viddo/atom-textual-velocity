watchProject = require('../src/watch-project.coffee')
Path = require('path')

# @param {String} projectPath  Absolute path to be scanned for files -> items
# @param ignoredNames {Array} list of relative file paths to ignore
# @emits add { projectPath, relPath, stats }
# @emits change { projectPath, relPath, stats }
# @emits unlink { projectPath, relPath }
module.exports = (projectPath, ignoredNames) ->
  terminate = @async()

  # massage from atom to chokidar-friendly ignored item
  ignoredNames = [".git", ".hg", ".svn", ".DS_Store", "._*", "Thumbs.db"].concat('node_modules')
  ignoredNames = ignoredNames.map (name) -> Path.join(projectPath, name)

  watcher = watchProject(projectPath, ignoredNames, emit)

  process.on 'message', ->
    watcher.close()
    terminate()
