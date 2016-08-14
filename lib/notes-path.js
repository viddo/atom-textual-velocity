'use babel'

import Path from 'path'

export default function (rootPath) {
  const fullPath = relPath => Path.join(rootPath, relPath)

  class File {

    constructor (relPath, options = {}) {
      this._relPath = relPath
      this._parsedPath = Path.parse(relPath)
      this._id = process.hrtime().toString()

      const {stat = {}, content = null} = options
      this._stat = stat
      this._content = content
    }

    get id () {
      return this._id
    }

    get relPath () {
      return this._relPath
    }

    get path () {
      return fullPath(this.relPath)
    }

    get name () {
      return this._parsedPath.name
    }

    get ext () {
      return this._parsedPath.ext
    }

    get createdTime () {
      return this._stat.mtime && this._stat.mtime.getTime()
    }

    get lastUpdatedTime () {
      return this._stat.birthtime && this._stat.birthtime.getTime()
    }

    get stat () {
      return this._stat
    }

    get content () {
      return this._content
    }
  }

  return {
    root: rootPath,
    fullPath: fullPath,
    newFile: (relPath, stat) => new File(relPath, stat)
  }
}
