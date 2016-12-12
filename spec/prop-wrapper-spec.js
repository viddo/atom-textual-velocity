/* @flow */

import PropWrapper from '../lib/prop-wrapper'

xdescribe('prop-wrapper', function () {
  let propWrapper, testObj, testObj2, propSpy

  beforeEach(function () {
    propWrapper = new PropWrapper()
    propSpy = jasmine.createSpy('propWrapper.prop')
    propWrapper.prop.onValue(propSpy)
  })

  afterEach(function () {
    propWrapper.dispose()
  })

  it('should have empty list by default', function () {
    expect(propSpy).toHaveBeenCalledWith([])
  })

  it('should update prop on adding/removing item', function () {
    testObj = {}
    propWrapper.add(testObj)
    expect(propSpy).toHaveBeenCalledWith([testObj])

    testObj2 = {}
    propWrapper.add(testObj2)
    expect(propSpy).toHaveBeenCalledWith([testObj, testObj2])

    propWrapper.remove(testObj)
    expect(propSpy).toHaveBeenCalledWith([testObj2])
  })
})
