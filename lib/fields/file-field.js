/* @flow */

import R from 'ramda'

export default class FileField {

  _name: string
  _rPath: Function

  constructor (params: {name: string, propPath: string}) {
    this._name = params.name
    this._rPath = R.path(params.propPath.split('.'))
  }

  get name (): string {
    return this._name
  }

  value (file: NotesFileType): any {
    return this._rPath(file)
  }
}
