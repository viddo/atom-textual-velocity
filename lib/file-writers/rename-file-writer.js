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

    try {
      fs.renameSync(oldPath, newPath) // https://nodejs.org/api/fs.html#fs_fs_rename_oldpath_newpath_callback
      var now = new Date()
      fs.utimesSync(newPath, now, now) // update last access/update times
    } catch (err) {
      callback(err)
      return
    }
    callback(null, null)
  }
}
