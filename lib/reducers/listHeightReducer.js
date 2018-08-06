/* @flow */

import * as A from "../actions";

import type { Action } from "../actions";

export default function listHeightReducer(state: number = 0, action: Action) {
  switch (action.type) {
    case A.RESIZED_LIST:
    case A.CHANGED_LIST_HEIGHT:
      return action.listHeight;

    default:
      return state;
  }
}
