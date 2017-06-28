/* @flow */

import { Disposable, CompositeDisposable } from "atom";

// Make it easier to define side-effects for BaconJS streams
//
// Example:
//   var disposable = new Disposables()
//   disposable.add(
//     someStream.onValue(val => {
//       console.log('will be removed on disposable.dispose()')
//     }))
export default class Disposables extends CompositeDisposable {
  add(...values: Array<IDisposable | Disposables | Function>) {
    for (let val of values) {
      if (!Disposable.isDisposable(val)) {
        if (typeof val === "function") {
          val = new Disposable(val);
        } else {
          console.error(
            `val is of type ${typeof val}, was expected to be disposable or a function`
          );
        }
      }
      super.add(val);
    }
  }
}
