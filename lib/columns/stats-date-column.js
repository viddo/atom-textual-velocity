/* @flow */

import moment from 'moment'

export default class StatsDateColumn {

  description: string
  sortField: string
  title: string
  width: number
  _notePropName: string

  constructor (params: {sortField: string, title: string, description: string, notePropName: string}) {
    this.description = params.description
    this.sortField = params.sortField
    this.title = params.title
    this.width = 15
    this._notePropName = params.notePropName
  }

  cellContent (params: CellContentParamsType): CellContentType {
    const {note} = params
    const date = note.stats && note.stats[this._notePropName]
    return date && moment(date.getTime()).fromNow() || ''
  }
}
