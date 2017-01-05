/* @flow */

import Sifter from 'sifter'

import {
  CHANGED_SORT_DIRECTION,
  CHANGED_SORT_FIELD,
  INITIAL_SCAN_DONE,
  RESET_SEARCH,
  SEARCH
} from '../action-creators'

export default function setupSifterResultReducer (notesFields: NotesFields) {
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
      case SEARCH:
        query = action.query
        break

      case CHANGED_SORT_FIELD:
      case CHANGED_SORT_DIRECTION:
        // always get sort params from nextConfig below
        query = state.query
        break

      case RESET_SEARCH:
      case INITIAL_SCAN_DONE:
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
