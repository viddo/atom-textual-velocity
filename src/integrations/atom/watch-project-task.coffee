Path           = require 'path'
gitignoreGlobs = require 'gitignore-globs'
watchPath      = require './watch-path'

# @param {String} projectPath  Absolute path to be scanned for files -> items
# @param {Array} ignoredNames list of relative file paths to ignore
# @param {Boolean} excludeVcsIgnoredPaths
# @emits add {projectPath, relPath, stats}
# @emits change {projectPath, relPath, stats}
# @emits unlink {projectPath, relPath}
module.exports = (projectPath, ignoredNames, excludeVcsIgnoredPaths) ->
  terminate = @async()

  # massage from atom to chokidar-friendly ignored item
  ignored = ignoredNames
    .concat if excludeVcsIgnoredPaths
        try
          gitignoreGlobs(Path.join(projectPath, '.gitignore'))
        catch
          []
      else
        []
    .concat if excludeVcsIgnoredPaths then ['.gitignore'] else []
    .map (name) ->
      Path.join(projectPath, name)

  watcher = watchPath(projectPath, ignored, (eventName, relPath, stats=undefined) ->
    emit(eventName, {
      relPath     : relPath
      projectPath : projectPath
      stats       : stats
    })
  )

  process.on 'message', ->
    watcher.close()
    terminate()
