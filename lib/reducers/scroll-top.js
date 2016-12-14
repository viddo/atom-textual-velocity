/* @flow */

export default function scrollTop (state: number = 0, action: Action) {
  switch (action.type) {
    case 'SCROLLED':
      return action.scrollTop
    default:
      return state
  }
}
