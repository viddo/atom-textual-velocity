/* @flow */

export default class StatsDateField {

  notePropName: string
  _statsPropName: string

  value: void | (note: NoteType, filename: string) => any

  constructor (params: {notePropName: string, statsPropName: string}) {
    this.notePropName = params.notePropName
    this._statsPropName = params.statsPropName
  }

  value (note: NoteType, filename: string): any {
    const date = note.stats && note.stats[this._statsPropName]
    return date && date.getTime()
  }
}
