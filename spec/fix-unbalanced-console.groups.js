'use babel'

import R from 'ramda'

// Modify jasmine to work with jasmine.any assertions
// expected to be called in a beforeAll(fixToEqualJasmineAny)
export default function () {
  beforeEach(function () {
    spyOn(console, 'groupCollapsed').andCallThrough()
    spyOn(console, 'groupEnd').andCallThrough()
  })

  afterEach(function () {
    const missingGroupEndCount = console.groupCollapsed.calls.length - console.groupEnd.calls.length
    R.times(() => console.groupEnd(), missingGroupEndCount)
  })
}
