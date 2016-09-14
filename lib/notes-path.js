/* @flow */

import Path from 'path'
import NotesFile from './notes-file'

export default (rootPath: string): NotesPathType => {
  const getFullPath = relPath => Path.join(rootPath, relPath)

  return {
    root: rootPath,
    fullPath: getFullPath,
    newFile: relPath => new NotesFile(relPath, getFullPath)
  }
}
