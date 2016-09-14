/* @flow */

import fs from 'fs'

export default {

  propName: 'content',

  read (path: string, callback: NodeCallbackType) {
    fs.readFile(path, 'utf8', callback)
  }
}
