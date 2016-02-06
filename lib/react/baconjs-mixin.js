'use babel'

// Mixin to add BaconJS side-effects easily to a React component
//
// E.g.
//  React.createClass(
//   mixins: [BaconMixin],
//   …
//
//     this.addBaconSideEffect(
//       observable.onValue((val) =>
//         this.setState({ foobar: val })))
//
export default {
  addBaconSideEffect (...fn) {
    if (!this._unsubscribeFns) this._unsubscribeFns = []
    this._unsubscribeFns = this._unsubscribeFns.concat(fn)
  },

  componentWillUnmount () {
    this._unsubscribeFns.forEach(fn => fn())
    this._unsubscribeFns = []
  }
}
