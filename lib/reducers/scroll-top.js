/* @flow */

import {
  CHANGED_LIST_HEIGHT,
  CHANGED_ROW_HEIGHT,
  RESET_SEARCH,
  SCROLLED,
  SEARCH,
  SELECT_NOTE
} from '../action-creators'

export default function scrollTop (state: number = 0, action: Action, nextConfig: Config, nextSelectedNote: ?SelectedNote) {
  switch (action.type) {
    case SCROLLED:
      return action.scrollTop

    case RESET_SEARCH:
    case SEARCH:
      return 0

    case SELECT_NOTE:
    case CHANGED_ROW_HEIGHT:
    case CHANGED_LIST_HEIGHT:
      const selectedNoteIndex: any = nextSelectedNote && nextSelectedNote.index

      if (Number.isInteger(selectedNoteIndex)) {
        const {listHeight, rowHeight} = nextConfig

        const selectedScrollTop = selectedNoteIndex * rowHeight

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

    default:
      return state
  }
}
