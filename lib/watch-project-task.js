'use babel'
/* global emit */

import Path from 'path'
import gitignoreGlobs from 'gitignore-globs'
import watchPath from './watch-path'

// @param {String} projectPath  Absolute path to be scanned for files -> items
// @param {Array} ignoredNames list of relative file paths to ignore
// @param {Boolean} excludeVcsIgnoredPaths
// @emits add {projectPath, relPath, stats}
// @emits change {projectPath, relPath, stats}
// @emits unlink {projectPath, relPath}
export default function watchProjectTask (projectPath, ignoredNames, excludeVcsIgnoredPaths) {
  let terminate = this.async()

  // massage from atom to chokidar-friendly ignored item
  if (excludeVcsIgnoredPaths) {
    try {
      ignoredNames = ignoredNames.concat(gitignoreGlobs(Path.join(projectPath, '.gitignore')))
    } catch (e) {
      // e.g. if .gitignore doesn't exist
    }
  }

  if (excludeVcsIgnoredPaths) {
    ignoredNames.push('.gitignore')
  }

  let ignored = ignoredNames.map(name =>
    Path.join(projectPath, name))

  let watcher = watchPath(projectPath, ignored, (eventName, relPath, stats = undefined) => {
    emit(eventName, {
      relPath: relPath,
      projectPath: projectPath,
      stats: stats
    })
  })

  process.on('message', () => {
    watcher.close()
    terminate()
  })
}
