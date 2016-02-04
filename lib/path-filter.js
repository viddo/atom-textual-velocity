'use babel'
import Path from 'path'
import R from 'ramda'
import fs from 'fs-plus'
import ScandalPathFilter from 'scandal/lib/path-filter'

export default class PathFilter {

  constructor (rootPath) {
    const opts = {
      exclusions: atom.config.get('core.ignoredNames'),
      excludeVcsIgnores: atom.config.get('core.excludeVcsIgnoredPaths')
    }

    const customCfg = atom.config.get('textualVelocity.customCfg') || []
    const cfg = customCfg.find(cfg => cfg.path === rootPath)
    let isTextFile

    if (cfg) {
      opts.inclusions = cfg.inclusions
      isTextFile = R.always(true)
    } else {
      opts.inclusions = ['*']
      isTextFile =
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

    this._scandalPathFilter = new ScandalPathFilter(rootPath, opts)
    this._isTextFile = isTextFile
  }

  isFileAccepted (path) {
    return this._scandalPathFilter.isFileAccepted(path) && this._isTextFile(path)
  }
}
