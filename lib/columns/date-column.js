/* @flow */

import moment from 'moment'

export default class DateColumn {

  _id: string
  _title: string
  _field: string

  constructor (args: {id: string, title: string, field: string}) {
    const {id, title, field} = args
    this._id = id
    this._title = title
    this._field = field
  }

  get id (): string {
    return this._id
  }

  get title (): string {
    return this._title
  }

  get width (): number {
    return 15
  }

  get field (): string {
    return this._field
  }

  cellContent (file: NotesFileType, res: RawSearchResultsType): CellContentType {
    return moment(file[this._field]).fromNow()
  }
}
