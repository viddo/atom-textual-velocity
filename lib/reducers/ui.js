/* @flow */

const defaults = {listHeight: 100}

function ui (state: UiStateType = defaults, action: ActionType) {
  switch (action.type) {
    case 'CHANGED_LIST_HEIGHT':
      return {
        ...state,
        listHeight: action.listHeight || 100
      }
    default:
      return state
  }
}

export default ui
