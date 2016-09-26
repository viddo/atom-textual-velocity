/* @flow */

export default class StatsDateField {

  _notePropName: string
  _statsPropName: string

  value: void | (note: NoteType, filename: string) => any

  constructor (params: {notePropName: string, statsPropName: string}) {
    this._notePropName = params.notePropName
    this._statsPropName = params.statsPropName
  }

  get notePropName (): string {
    return this._notePropName
  }

  value (note: NoteType, filename: string): any {
    const date = note.stats && note.stats[this._statsPropName]
    return date && date.getTime()
  }
}
