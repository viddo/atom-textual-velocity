/* @flow */

import * as C from "../action-constants";

export default function listHeightReducer(state: number = 0, action: Action) {
  switch (action.type) {
    case C.RESIZED_LIST:
    case C.CHANGED_LIST_HEIGHT:
      return action.listHeight;

    default:
      return state;
  }
}
