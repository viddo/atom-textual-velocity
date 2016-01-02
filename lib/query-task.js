'use babel'
/* global emit */
import query from './query'

export default function (paths, searchStr) {
  const terminate = this.async()
  query(paths, searchStr, emit, terminate)
}
