/* @flow */

function ui (state: any, action: any) {
  switch (action.type) {
    case 'CHANGED_LIST_HEIGHT':
      return {...state, listHeight: action.listHeight || 100}
    default:
      return state || {
        listHeight: 100
      }
  }
}

export default ui
