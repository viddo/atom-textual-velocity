/* @flow */

import { Observable } from "rxjs";

export default function observe(obj: Object, method: string) {
  if (method.trim().length === 0)
    throw new Error(`method must be a non-empty string`);
  if (typeof obj[method] !== "function")
    throw new Error(`method must be a function on the given object`);

  return Observable.create(function subscribe(observer) {
    const disposable = obj[method]((value: any) => {
      observer.next(value);
    });

    return function unsubscribe() {
      disposable.dispose();
      observer.complete();
    };
  });
}
