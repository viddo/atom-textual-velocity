/* @flow */

import Path from 'path'

export default (rootPath: string): NotesPathType => {
  return {
    root: rootPath,
    fullPath: relPath => Path.join(rootPath, relPath),
    relPath: path => path.replace(rootPath + Path.sep, '')
  }
}
