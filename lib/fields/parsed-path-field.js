/* @flow */

import Path from 'path'

export default class ParsedPathField {

  _notePropName: string
  _parsedPathPropName: string

  value: void | (note: NoteType, relPath: string) => any

  constructor (params: {notePropName: string, parsedPathPropName: string}) {
    this._notePropName = params.notePropName
    this._parsedPathPropName = params.parsedPathPropName
  }

  get notePropName (): string {
    return this._notePropName
  }

  value (note: NoteType, relPath: string): any {
    return Path.parse(relPath)[this._parsedPathPropName]
  }
}
