/* @flow */

import { takeUntil } from "rxjs/operators";
import { ofType } from "redux-observable";
import * as A from "./actions";

import type { Action } from "./actions";

const takeUntilDispose = (action$: rxjs$Observable<Action>) => {
  return takeUntil(action$.pipe(ofType(A.DISPOSE_STORE)));
};

export default takeUntilDispose;
