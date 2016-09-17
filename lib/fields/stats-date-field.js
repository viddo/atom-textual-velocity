/* @flow */

export default class StatsDateField {

  _filePropName: string
  _statsPropName: string
  value: void | (file: NotesFileType) => any

  constructor (params: {filePropName: string, statsPropName: string}) {
    this._filePropName = params.filePropName
    this._statsPropName = params.statsPropName
  }

  get filePropName (): string {
    return this._filePropName
  }

  value (file: NotesFileType): any {
    const date = file.stats && file.stats[this._statsPropName]
    return date && date.getTime()
  }
}
