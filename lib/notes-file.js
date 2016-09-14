/* @flow */

import Path from 'path'

export default class NotesFile { // eslint-disable-line

  data: Object

  _relPath: string
  _getFullPath: (a: string) => string
  _parsedPath: {base: string, name: string, ext: string} // https://nodejs.org/api/path.html#path_path_parse_path
  _id: string

  constructor (relPath: string, getFullPath: (relPath: string) => string, data?: Object = {}) {
    this._getFullPath = getFullPath
    this._relPath = relPath
    this._parsedPath = Path.parse(relPath)
    this._id = process.hrtime().toString()

    this.data = data
  }

  get id (): string {
    return this._id
  }

  get relPath (): string {
    return this._relPath
  }

  get path (): string {
    return this._getFullPath(this._relPath)
  }

  get base (): string {
    return this._parsedPath.base
  }

  get name (): string {
    return this._parsedPath.name
  }

  get ext (): string {
    return this._parsedPath.ext
  }
}
