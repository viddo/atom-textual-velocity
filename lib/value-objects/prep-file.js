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

    constructor (relPath, stat = false, content = null) {
      this._id = process.hrtime().toString()
      this._relPath = relPath
      this._content = content

      this._stat = stat || fs.statSync(File.fullPath(relPath))
      this._parsedPath = Path.parse(relPath)
    }

    withContent (content) {
      return new File(this.relPath, this._stat, content)
    }

    get id () {
      return this._id
    }

    get relPath () {
      return this._relPath
    }

    get path () {
      return File.fullPath(this.relPath)
    }

    get name () {
      return this._parsedPath.name
    }

    get ext () {
      return this._parsedPath.ext
    }

    get createdTime () {
      return this._stat.mtime.getTime()
    }

    get lastUpdatedTime () {
      return this._stat.birthtime.getTime()
    }

    get content () {
      return this._content
    }
  }
}
