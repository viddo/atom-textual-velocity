/* @flow */

import moment from 'moment'

export default class StatsDateColumn {

  _sortField: string
  _title: string
  _description: string
  _prop: string

  constructor (params: {sortField: string, title: string, description: string, prop: string}) {
    this._sortField = params.sortField
    this._title = params.title
    this._description = params.description
    this._prop = params.prop
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

  cellContent (file: NotesFileType): CellContentType {
    const date = file.data.stats && file.data.stats[this._prop]
    return date && moment(date.getTime()).fromNow() || ''
  }
}
