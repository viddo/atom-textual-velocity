'use babel'

import BaconMixin from '../../lib/react/baconjs-mixin'

describe('BaconMixin', function () {
  describe('.addBaconSideEffect', function () {
    let spy1, spy2

    beforeEach(function () {
      spy1 = jasmine.createSpy('fn')
      spy2 = jasmine.createSpy('fn')
      BaconMixin.addBaconSideEffect(spy1)
      BaconMixin.addBaconSideEffect(spy2)
    })

    it('should add side-effects dispose functions to a list', function () {
      expect(BaconMixin._unsubscribeFns.length).toEqual(2)
      expect(spy1).not.toHaveBeenCalled()
      expect(spy2).not.toHaveBeenCalled()
    })

    describe('when component will unmount', function () {
      beforeEach(function () {
        BaconMixin.componentWillUnmount()
      })

      it('should clean list', function () {
        expect(spy1).toHaveBeenCalled()
        expect(spy2).toHaveBeenCalled()
        expect(BaconMixin._unsubscribeFns.length).toEqual(0)
      })
    })
  })
})
