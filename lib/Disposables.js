// NOTE Using standard ES6 code without flow/ES modules here
// to make the extension of the parent class to work.
// If applying babel the transpiled code is incompatible and would throw:
// "Class constructor CompositeDisposable cannot be invoked without 'new'"
const { Disposable, CompositeDisposable } = require("atom");

class Disposables extends CompositeDisposable {
  add(...values) {
    // until https://github.com/eslint/eslint/issues/12117 is resolved:
    // eslint-disable-next-line no-unused-vars
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

module.exports = Disposables;
