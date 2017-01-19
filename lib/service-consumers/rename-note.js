/* @flow */
import fs from 'fs'
import Path from 'path'
import R from 'ramda'
import Disposables from '../disposables'

export default {

  consumeServiceV0 (service: ServiceV0Type, editCellName: string) {
    service.registerFileWriters({
      editCellName,

      write (oldPath: string, filename: string, callback: Function) {
        filename = R.last(filename.split(Path.sep)).trim()
        if (filename === '') return

        const rootPath = R.init(oldPath.split(Path.sep)).join(Path.sep)
        const newPath = Path.normalize(Path.join(rootPath, filename))

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
    })

    return new Disposables(
      atom.commands.add('atom-workspace', 'textual-velocity:rename-note', () => {
        atom.config.set('textual-velocity.editCellName', editCellName)
      })
    )
  }
}
