/* @flow */

import fs from 'fs'

export default {

  notePropName: 'stats',
  skipIfHasStatsForNewFile: true,

  read (path: string, callback: NodeCallbackType) {
    fs.stat(path, callback)
  }
}
