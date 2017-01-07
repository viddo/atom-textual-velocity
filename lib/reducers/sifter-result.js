/* @flow */

import Sifter from 'sifter'
import * as A from '../action-creators'

export default function makeSifterResultReducer (notesFields: NotesFields) {
  const sifter = new Sifter()

  const defaults = {
    items: [],
    options: {
      fields: [],
      sort: []
    },
    query: '',
    tokens: [],
    total: 0
  }

  return function sifterResultReducer (state: SifterResult = defaults, action: Action, nextConfig: Config, nextNotes: Notes) {
    let query

    switch (action.type) {
      case A.SEARCH:
        query = action.query
        break

      case A.CHANGED_SORT_FIELD:
      case A.CHANGED_SORT_DIRECTION:
        // always get sort params from nextConfig below
        query = state.query
        break

      case A.RESET_SEARCH:
      case A.INITIAL_SCAN_DONE:
        query = ''
        break

      default:
        return state
    }

    sifter.items = nextNotes // use notes as items to be search

    return sifter.search(query, {
      fields: notesFields.propNames(),
      sort: [
        {field: nextConfig.sortField, direction: nextConfig.sortDirection},
        {field: '$score', direction: 'desc'}
      ],
      conjunction: 'and'
    })
  }
}
