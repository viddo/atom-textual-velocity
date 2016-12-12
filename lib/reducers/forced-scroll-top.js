/* @flow */

export default function forcedScrollTopReducer (state: ?number = null, action: Action) {
  switch (action.type) {
    case 'SEARCH':
      return 0
    default:
      return null
  }
}
