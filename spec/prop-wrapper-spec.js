/* @flow */

import PropWrapper from '../lib/prop-wrapper'

describe('prop-wrapper', function () {
  let propWrapper, testObj, testObj2, propSpy

  beforeEach(function () {
    propWrapper = new PropWrapper()
    propSpy = jasmine.createSpy('propWrapper.prop')
    propWrapper.prop.onValue(propSpy)
  })

  afterEach(function () {
    propWrapper.dispose()
  })

  it('should have ', function () {
    expect(propSpy).toHaveBeenCalledWith([])
  })

  it('should update prop on adding an item', function () {
    testObj = {}
    propWrapper.add(testObj)
    expect(propSpy).toHaveBeenCalledWith([testObj])

    testObj2 = {}
    propWrapper.add(testObj2)
    expect(propSpy).toHaveBeenCalledWith([testObj, testObj2])
  })
})
