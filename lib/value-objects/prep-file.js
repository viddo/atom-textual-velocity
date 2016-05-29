'use babel'

import fs from 'fs'
import Path from 'path'
import PathFilter from './path-filter'

export default function (rootPath, options = {}) {
  const pathFilter = new PathFilter(rootPath, {
    exclusions: options.ignoredNames,
    excludeVcsIgnores: options.excludeVcsIgnoredPaths
  })

  return class File {

    static accepts (relPath) {
      return pathFilter.isFileAccepted(this.fullPath(relPath))
    }

    static fullPath (relPath) {
      return Path.join(rootPath, relPath)
    }

    constructor (relPath, stat) {
      this.id = process.hrtime().toString()
      this.relPath = relPath

      this._stat = stat || fs.statSync(File.fullPath(relPath))
      this._parsedPath = Path.parse(relPath)
    }

    path () {
      return File.fullPath(this.relPath)
    }

    name () {
      return this._parsedPath.name
    }

    ext () {
      return this._parsedPath.ext
    }

    content () {
      return 'TBD'
    }
  }
}
