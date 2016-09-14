/* @flow */

import fs from 'fs'

export default {

  propName: 'stats',

  skipRead (file: NotesFileType, contextInfo: Object) {
    return contextInfo.isNewFile && file.data.stats
  },

  read (path: string, callback: NodeCallbackType) {
    fs.stat(path, callback)
  }
}
