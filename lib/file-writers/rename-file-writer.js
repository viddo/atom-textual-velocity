/* @flow */

import fs from 'fs'
import Path from 'path'
import R from 'ramda'

export default {
  editCellName: 'base',

  write (oldPath: string, base: string, callback: Function) {
    base = R.last(base.split(Path.sep)).trim()
    if (base === '') return

    const rootPath = R.init(oldPath.split(Path.sep)).join(Path.sep)
    const newPath = Path.normalize(Path.join(rootPath, base))

    // https://nodejs.org/api/fs.html#fs_fs_rename_oldpath_newpath_callback
    fs.rename(oldPath, newPath, callback)
  }
}
