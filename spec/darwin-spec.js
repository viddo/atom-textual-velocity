'use babel'
import temp from 'temp'
import * as darwin from '../lib/darwin'

xdescribe('darwin', () => {
  let path, callbackSpy

  beforeEach(function () {
    temp.track()
    const f = temp.openSync('file-with-tags')
    path = f.path
    callbackSpy = jasmine.createSpy('callback')
  })

  it('allows to get and set tags', function () {
    darwin.getTags(path, callbackSpy)
    expect(callbackSpy).not.toHaveBeenCalled()

    darwin.setTags(path, ['1st', '2nd', '3rd'])
    darwin.getTags(path, callbackSpy)
    waitsFor(() => {
      return callbackSpy.calls.length >= 1
    })
    runs(() => {
      expect(callbackSpy.calls[0].args[1]).toEqual([['1st', '2nd', '3rd']])
    })
  })
})
