'use babel'
import Path from 'path'
import R from 'ramda'
import fs from 'fs-plus'
import ScandalPathFilter from 'scandal/lib/path-filter'

export default class PathFilter {

  constructor (rootPath) {
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

    this._scandalPathFilter = new ScandalPathFilter(rootPath, {
      exclusions: atom.config.get('core.ignoredNames'),
      excludeVcsIgnores: atom.config.get('core.excludeVcsIgnoredPaths'),
      inclusions: ['*']
    })
  }

  isFileAccepted (path) {
    return this._scandalPathFilter.isFileAccepted(path) && this._isTextFile(path)
  }
}
