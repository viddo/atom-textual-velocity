/* @flow */

export default class StatsDateField {

  _name: string
  _prop: string

  constructor (params: {name: string, prop: string}) {
    this._name = params.name
    this._prop = params.prop
  }

  get name (): string {
    return this._name
  }

  value (file: NotesFileType): any {
    const date = file.data.stats && file.data.stats[this._prop]
    return date && date.getTime()
  }
}
