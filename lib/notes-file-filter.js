'use babel'

import Path from 'path'
import R from 'ramda'
import fs from 'fs-plus'
import ScandalPathFilter from 'scandal/lib/path-filter'

export default class NotesFileFilter extends ScandalPathFilter {

  constructor (path, options = {}) {
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

  isAccepted (path) {
    return super.isFileAccepted(path) && this._isTextFile(path)
  }
}
