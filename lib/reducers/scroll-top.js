/* @flow */

import * as C from "../action-constants";

export default function scrollTop(
  state: number = 0,
  action: Action,
  listHeight: number,
  rowHeight: number,
  nextSelectedNote: ?SelectedNote
) {
  switch (action.type) {
    case C.SCROLLED:
      return action.scrollTop;

    case C.RESET_SEARCH:
    case C.SEARCH:
      return 0;

    case C.CHANGED_ACTIVE_PANE_ITEM:
    case C.SELECT_NEXT:
    case C.SELECT_PREV:
      if (nextSelectedNote) {
        const selectedScrollTop = nextSelectedNote.index * rowHeight;

        if (state + listHeight < selectedScrollTop + rowHeight) {
          // selected file X is located after the visible bounds
          // from: ..[...]..X..
          // to:   ......[..X].
          return selectedScrollTop + rowHeight - listHeight;
        } else if (state > selectedScrollTop) {
          // selected file X is located before the visible bounds
          // from: ..X..[...]..
          // to:   .[X..]......
          return selectedScrollTop;
        }
      }

      return state; // no selection -or- selection is within visible viewport

    default:
      return state;
  }
}
