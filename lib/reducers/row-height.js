/* @flow */

import * as C from "../action-constants";

export default function rowHeightReducer(state: number = 25, action: Action) {
  switch (action.type) {
    case C.CHANGED_ROW_HEIGHT:
      return action.rowHeight;

    default:
      return state;
  }
}
