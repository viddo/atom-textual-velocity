/* @flow */

export default function forcedScrollTopReducer (state: ?number = null, action: Action, scrollTop: number, config: Config, selected: Selected) {
  switch (action.type) {
    case 'RESET_SEARCH':
    case 'SEARCH':
      return 0
    case 'CHANGED_LIST_HEIGHT':
    case 'CHANGED_ROW_HEIGHT':
    case 'CHANGED_SORT_FIELD':
    case 'CHANGED_SORT_DIRECTION':
    case 'SELECT_PREV_NOTE':
    case 'SELECT_NEXT_NOTE':
      const selectedIndex: any = selected && selected.index

      if (Number.isInteger(selectedIndex)) {
        const {listHeight, rowHeight} = config
        scrollTop = ((Number.isInteger(state) ? state : scrollTop): any)

        const selectedScrollTop = selectedIndex * rowHeight

        if (scrollTop + listHeight < selectedScrollTop + rowHeight) {
          // selected file X is located after the visible bounds
          // from: ..[...]..X..
          // to:   ......[..X].
          return selectedScrollTop + rowHeight - listHeight
        } else if (scrollTop > selectedScrollTop) {
          // selected file X is located before the visible bounds
          // from: ..X..[...]..
          // to:   .[X..]......
          return selectedScrollTop
        }
      }

      return null
    default:
      return null
  }
}
