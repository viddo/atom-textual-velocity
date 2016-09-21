/* @flow */

import fs from 'fs'

export default {

  filePropName: 'stats',
  skipIfHasStatsForNewFile: true,

  read (path: string, callback: NodeCallbackType) {
    fs.stat(path, callback)
  }
}
