/* @flow */

import {start, limit} from '../pagination'

const defaults = {start: 0, limit: 0}

export default function pagination (state: Pagination = defaults, action: Action, nextConfig: Config) {
  switch (action.type) {
    case 'SEARCH':
      return {...state, start: 0}
    case 'SCROLLED':
      return {
        ...state,
        start: start({
          scrollTop: action.scrollTop,
          rowHeight: nextConfig.rowHeight
        })
      }
    case 'INITIAL_SCAN_DONE':
    case 'RESIZED_LIST':
    case 'CHANGED_LIST_HEIGHT':
      return {
        ...state,
        limit: limit(nextConfig)
      }
    default:
      return state
  }
}
