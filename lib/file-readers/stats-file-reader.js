/* @flow */

import fs from 'fs'

export default {

  filePropName: 'stats',

  skipRead (file: NotesFileType, contextInfo: Object) {
    return contextInfo.isNewFile && file.stats
  },

  read (path: string, callback: NodeCallbackType) {
    fs.stat(path, callback)
  }
}
