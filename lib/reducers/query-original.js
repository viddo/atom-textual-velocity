/* @flow */

import * as C from "../action-constants";

export default function queryOriginal(state: string = "", action: Action) {
  switch (action.type) {
    case C.RESET_SEARCH:
      return "";

    case C.SEARCH:
      return action.query;

    default:
      return state;
  }
}
