/* @flow */

import Path from 'path'
import R from 'ramda'
import fs from 'fs-plus'
import ScandalPathFilter from './scandal-path-filter'

export default class NotesFileFilter extends ScandalPathFilter {

  constructor (path: string, options: Object = {}) {
    options.inclusions = ['*']
    super(path, options)

    this._isTextFile =
      R.pipe(
        Path.extname,
        R.anyPass([
          fs.isCompressedExtension,
          fs.isImageExtension,
          fs.isPdfExtension,
          fs.isBinaryExtension
        ]),
        R.not)
  }

  isAccepted (path: string) {
    return super.isFileAccepted(path) && this._isTextFile(path) && !path.endsWith('Notes & Settings')
  }
}
