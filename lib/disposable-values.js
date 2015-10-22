'use babel'

import {
  Disposable,
  CompositeDisposable
} from 'atom'

class DisposableValues extends CompositeDisposable {

  add (...values) {
    for (let val of values) {
      if (!Disposable.isDisposable(val)) {
        if (typeof val === 'function') {
          val = new Disposable(val)
        } else {
          console.warn(`val is of type ${typeof val}, was expected to be disposable or a function`)
          return false
        }
      }
      super.add(val)
    }
  }

}

export default DisposableValues
