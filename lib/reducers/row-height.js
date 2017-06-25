/* @flow */

import * as A from "../action-creators";

export default function rowHeightReducer(state: number = 25, action: Action) {
  switch (action.type) {
    case A.CHANGED_ROW_HEIGHT:
      return action.rowHeight;

    default:
      return state;
  }
}
