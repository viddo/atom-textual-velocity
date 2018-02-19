/* @flow */

import { Observable } from "rxjs";

export default function observeAtomObj(
  obj: Object,
  method: string,
  args?: string[]
) {
  if (typeof obj[method] !== "function")
    throw new Error(`${method} must be a function on the given object`);

  return Observable.create(function subscribe(observer) {
    const disposable = obj[method].apply(
      obj,
      (args || []).concat((value: any) => {
        observer.next(value);
      })
    );

    return function unsubscribeObserveAtomObj() {
      disposable.dispose();
      observer.complete();
    };
  });
}
