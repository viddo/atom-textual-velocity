/* @flow */

import {start} from '../pagination'

export default function pagination (state: Pagination = {start: 0, limit: 0}, action: Action, config: Config) {
  switch (action.type) {
    case 'SCROLLED':
      return {
        ...state,
        start: start({
          scrollTop: action.scrollTop,
          rowHeight: config.rowHeight
        })
      }
    default:
      return state
  }
}
