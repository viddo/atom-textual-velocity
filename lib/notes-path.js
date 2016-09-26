/* @flow */

import Path from 'path'

export default (rootPath: string): NotesPathType => {
  return {
    root: rootPath,
    fullPath: filename => Path.join(rootPath, filename),
    filename: path => path.replace(rootPath + Path.sep, '')
  }
}
