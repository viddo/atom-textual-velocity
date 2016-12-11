/* @flow */

export default function query (state: string = '', action: Action) {
  switch (action.type) {
    case 'SEARCH':
      return action.query
    default:
      return state
  }
}
