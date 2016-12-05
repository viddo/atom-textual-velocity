/* @flow */

function ui (state: {} = {}, action: any) {
  switch (action.type) {
    case 'CHANGED_LIST_HEIGHT':
      return {...state, listHeight: action.listHeight || 100}
    default:
      return state
  }
}

export default ui
