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

  return function sifterResultReducer (state: SifterResult = defaults, action: Action, config: Config, notes: Notes) {
    let {query} = state

    // NOTE if you add/remove cases you probably want to update the visible-rows reducer, too
    switch (action.type) {
      case 'SEARCH':
        query = action.query
        break
      case 'CHANGED_SORT_FIELD':
      case 'CHANGED_SORT_DIRECTION':
        // always get sort params from nextState.config below
        break
      case 'RESET_SEARCH':
      case 'INITIAL_SCAN_DONE':
        query = ''
        break
      default:
        return state
    }

    sifter.items = notes // use notes as items to be search

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
