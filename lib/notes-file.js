/* @flow */

import Path from 'path'

export default class NotesFile { // eslint-disable-line

  _relPath: string
  _getfullPath: (a: string) => string
  _parsedPath: {name: string, ext: string} // https://nodejs.org/api/path.html#path_path_parse_path
  _id: string
  _stats: FsStatsType
  _content: string | void

  constructor (getfullPath: (a: string) => string, relPath: string, options?: NotesFileOptionsType) {
    this._getfullPath = getfullPath
    this._relPath = relPath
    this._parsedPath = Path.parse(relPath)
    this._id = process.hrtime().toString()

    const {stats = {}, content} = options || {}
    this._stats = stats
    this._content = content
  }

  get id (): string {
    return this._id
  }

  get relPath (): string {
    return this._relPath
  }

  get path (): string {
    return this._getfullPath(this._relPath)
  }

  get name (): string {
    return this._parsedPath.name
  }

  get ext (): string {
    return this._parsedPath.ext
  }

  get createdTime (): number | void {
    return this._stats.mtime && this._stats.mtime.getTime()
  }

  get lastUpdatedTime (): number | void {
    return this._stats.birthtime && this._stats.birthtime.getTime()
  }

  get stats (): FsStatsType {
    return this._stats
  }

  get content (): string | void {
    return this._content
  }
}
