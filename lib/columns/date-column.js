/* @flow */

import moment from 'moment'

export default class DateColumn {

  _title: string
  _field: string

  constructor (args: {title: string, field: string}) {
    const {title, field} = args
    this._title = title
    this._field = field
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

  cellContent (file: NotesFileType, res: SearchResultsType): CellContentType {
    return moment(file[this._field]).fromNow()
  }
}
