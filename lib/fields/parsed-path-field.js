/* @flow */

import Path from 'path'

export default class ParsedPathField {

  notePropName: string
  _parsedPathPropName: string

  value: void | (note: Note, filename: string) => any

  constructor (params: {notePropName: string, parsedPathPropName: string}) {
    this.notePropName = params.notePropName
    this._parsedPathPropName = params.parsedPathPropName
  }

  value (note: Note, filename: string): any {
    return Path.parse(filename)[this._parsedPathPropName]
  }
}
