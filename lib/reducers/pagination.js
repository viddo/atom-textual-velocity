/* @flow */

import {
  CHANGED_LIST_HEIGHT,
  CHANGED_ROW_HEIGHT,
  CHANGED_SORT_DIRECTION,
  CHANGED_SORT_FIELD,
  INITIAL_SCAN_DONE,
  RESET_SEARCH,
  RESIZED_LIST,
  SCROLLED,
  SEARCH,
  SELECT_NOTE
} from '../action-creators'

const defaults = {start: 0, limit: 0}
const VISIBLE_PADDING = 2

export default function pagination (state: Pagination = defaults, action: Action, nextConfig: Config, nextScrollTop: number) {
  switch (action.type) {
    case SCROLLED:
    case RESET_SEARCH:
    case SEARCH:
    case SELECT_NOTE:
    case CHANGED_SORT_FIELD:
    case CHANGED_SORT_DIRECTION:
    case CHANGED_LIST_HEIGHT:
    case RESIZED_LIST:
    case CHANGED_ROW_HEIGHT:
    case INITIAL_SCAN_DONE:
      return {
        start: (nextScrollTop / nextConfig.rowHeight) | 0,
        limit: ((nextConfig.listHeight / nextConfig.rowHeight) | 0) + VISIBLE_PADDING
      }

    default:
      return state
  }
}
