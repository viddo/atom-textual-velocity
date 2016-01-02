'use babel'
/* global emit, process */
import watchProjectFolder from './watch-project-folder'

export default function (projectPath, ignoredNames, excludeVcsIgnores) {
  const terminate = this.async()
  watchProjectFolder(projectPath, ignoredNames, excludeVcsIgnores, emit)
  process.on('message', () => {
    terminate()
  })
}
