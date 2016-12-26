/* @flow */

import {DESELECT_NOTE, SELECT_NOTE} from '../action-creators'

export default function selected (state: ?SelectedNote = null, action: Action) {
  switch (action.type) {
    case DESELECT_NOTE:
      return null
    case SELECT_NOTE:
      return action.selectedNote
    default:
      return state
  }
}
