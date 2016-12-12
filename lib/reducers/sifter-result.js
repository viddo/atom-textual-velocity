/* @flow */

import Sifter from 'sifter'

const sifter = new Sifter()

export default (notesFields: NotesFields) =>
  (state: SifterResult, action: Action, nextState: State) => {
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
