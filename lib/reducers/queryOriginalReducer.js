/* @flow */

import * as A from "../actions";
import type { Action } from "../actions";

export default function queryOriginalReducer(
  state: string = "",
  action: Action
) {
  switch (action.type) {
    case A.RESET_SEARCH:
      return "";

    case A.SEARCH:
      return action.query;

    default:
      return state;
  }
}
