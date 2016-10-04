/* @flow */

import moment from 'moment'

export default class StatsDateColumn {

  _sortField: string
  _title: string
  _description: string
  _notePropName: string

  constructor (params: {sortField: string, title: string, description: string, notePropName: string}) {
    this._sortField = params.sortField
    this._title = params.title
    this._description = params.description
    this._notePropName = params.notePropName
  }

  get sortField (): string {
    return this._sortField
  }

  get title (): string {
    return this._title
  }

  get description (): string {
    return this._description
  }

  get width (): number {
    return 15
  }

  cellContent (params: CellContentParamsType): CellContentType {
    const {note} = params
    const date = note.stats && note.stats[this._notePropName]
    return date && moment(date.getTime()).fromNow() || ''
  }
}
