'use babel'

import moment from 'moment'

export default class Summary {

  constructor ({id, title, field}) {
    this._id = id
    this._title = title
    this._field = field
  }

  get id () {
    return this._id
  }

  get title () {
    return this._title
  }

  get width () {
    return 15
  }

  get field () {
    return this._field
  }

  cellContent (file) {
    return moment(file[this._field]).fromNow()
  }
}
