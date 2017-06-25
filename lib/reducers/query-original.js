/* @flow */

import * as A from "../action-creators";

export default function queryOriginal(state: string = "", action: Action) {
  switch (action.type) {
    case A.RESET_SEARCH:
      return "";

    case A.SEARCH:
      return action.query;

    default:
      return state;
  }
}
