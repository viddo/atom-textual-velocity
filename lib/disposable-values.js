'use babel'

import {
  Disposable,
  CompositeDisposable
} from 'atom'

// Make it easier to define side-effects for BaconJS streams
//
// Example:
//   var disposable = new DisposableValues()
//   disposable.add(
//     someStream.onValue(val => {
//       console.log('will be removed on disposable.dispose()')
//     }))
export default class DisposableValues extends CompositeDisposable {

  add (...values) {
    for (let val of values) {
      if (!Disposable.isDisposable(val)) {
        if (typeof val === 'function') {
          val = new Disposable(val)
        } else {
          console.error(`val is of type ${typeof val}, was expected to be disposable or a function`)
          return false
        }
      }
      super.add(val)
    }
  }

}
