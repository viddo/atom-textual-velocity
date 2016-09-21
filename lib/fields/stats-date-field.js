/* @flow */

export default class StatsDateField {

  _filePropName: string
  _statsPropName: string

  value: void | (note: NoteType, relPath: string) => any

  constructor (params: {filePropName: string, statsPropName: string}) {
    this._filePropName = params.filePropName
    this._statsPropName = params.statsPropName
  }

  get filePropName (): string {
    return this._filePropName
  }

  value (note: NoteType, relPath: string): any {
    const date = note.stats && note.stats[this._statsPropName]
    return date && date.getTime()
  }
}
