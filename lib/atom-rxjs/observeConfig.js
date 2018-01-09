/* @flow */

import { Observable } from "rxjs";

export default function observeConfig(key: string) {
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
