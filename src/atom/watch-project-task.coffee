watchProject = require '../watch-project.coffee'
Path = require 'path'
gitignoreGlobs = require 'gitignore-globs'

# @param {String} projectPath  Absolute path to be scanned for files -> items
# @param {Array} ignoredNames list of relative file paths to ignore
# @param {Boolean} excludeVcsIgnoredPaths
# @emits add { projectPath, relPath, stats }
# @emits change { projectPath, relPath, stats }
# @emits unlink { projectPath, relPath }
module.exports = (projectPath, ignoredNames, excludeVcsIgnoredPaths) ->
  terminate = @async()

  # massage from atom to chokidar-friendly ignored item
  ignored = ignoredNames
    .concat if excludeVcsIgnoredPaths then gitignoreGlobs(Path.join(projectPath, '.gitignore')) else []
    .concat if excludeVcsIgnoredPaths then ['.gitignore'] else []
    .map (name) ->
      Path.join(projectPath, name)

  watcher = watchProject(projectPath, ignored, emit)

  process.on 'message', ->
    watcher.close()
    terminate()
