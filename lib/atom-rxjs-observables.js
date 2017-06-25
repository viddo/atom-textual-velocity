/* @flow */

import { Observable } from "rxjs";

export function observeConfig(key: string) {
  if (typeof key !== "string")
    throw new Error(
      `key must be a string, given key was ${JSON.stringify(key)}`
    );
  if (key.trim().length === 0)
    throw new Error(`key must be a non-empty string`);

  return Observable.create(function subscribe(observer) {
    const disposable = atom.config.observe(key, (value: any) => {
      observer.next(value);
    });

    return function unsubscribe() {
      disposable.dispose();
      observer.complete();
    };
  });
}

export function observe(obj: Object, method: string) {
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
