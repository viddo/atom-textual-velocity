/* @flow */

import Sifter from 'sifter'

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

  return function sifterResultReducer (state: SifterResult = defaults, action: Action, nextState: State) {
    let query

    switch (action.type) {
      case 'SEARCH':
        query = action.query
        break
      case 'INITIAL_SCAN_DONE':
        query = state.query
        break
      default:
        return state
    }

    const config = nextState.config

    sifter.items = nextState.notes // use notes as items to be search

    return sifter.search(query, {
      fields: notesFields.propNames(),
      sort: [
        {field: config.sortField, direction: config.sortDirection},
        {field: '$score', direction: 'desc'}
      ],
      conjunction: 'and'
    })
  }
}
