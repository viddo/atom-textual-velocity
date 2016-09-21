/* @flow */

import Path from 'path'

export default class ParsedPathField {

  _filePropName: string
  _parsedPathPropName: string

  value: void | (note: NoteType, relPath: string) => any

  constructor (params: {filePropName: string, parsedPathPropName: string}) {
    this._filePropName = params.filePropName
    this._parsedPathPropName = params.parsedPathPropName
  }

  get filePropName (): string {
    return this._filePropName
  }

  value (note: NoteType, relPath: string): any {
    return Path.parse(relPath)[this._parsedPathPropName]
  }
}
