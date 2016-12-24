/* @flow */

import {
  CHANGED_LIST_HEIGHT,
  CHANGED_ROW_HEIGHT,
  CHANGED_SORT_DIRECTION,
  CHANGED_SORT_FIELD,
  RESET_SEARCH,
  SEARCH,
  SCROLLED,
  SELECT_NEXT_NOTE,
  SELECT_PREV_NOTE
} from '../action-creators'

export default function scrollTop (state: number = 0, action: Action, nextConfig: Config, nextSelected: Selected) {
  switch (action.type) {
    case SCROLLED:
      return action.scrollTop

    case SELECT_PREV_NOTE:
    case SELECT_NEXT_NOTE:
    case CHANGED_SORT_FIELD:
    case CHANGED_SORT_DIRECTION:
    case CHANGED_ROW_HEIGHT:
    case CHANGED_LIST_HEIGHT:
      const selectedIndex: any = nextSelected && nextSelected.index

      if (Number.isInteger(selectedIndex)) {
        const {listHeight, rowHeight} = nextConfig

        const selectedScrollTop = selectedIndex * rowHeight

        if (state + listHeight < selectedScrollTop + rowHeight) {
          // selected file X is located after the visible bounds
          // from: ..[...]..X..
          // to:   ......[..X].
          return selectedScrollTop + rowHeight - listHeight
        } else if (state > selectedScrollTop) {
          // selected file X is located before the visible bounds
          // from: ..X..[...]..
          // to:   .[X..]......
          return selectedScrollTop
        }
      }

      return state // no selection -or- selection is within visible viewport

    case RESET_SEARCH:
    case SEARCH:
      return 0

    default:
      return state
  }
}
