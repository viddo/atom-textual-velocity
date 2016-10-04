'use babel'

// Remove the custom equalityTest added by atom:
// https://github.com/atom/atom/blob/1500381ac9216bd533199f5b59460b5ac596527c/spec/spec-helper.coffee#L45
// so assertions such as `expect(foo).toEqual(jasmine.any(Object))` works
global.jasmine.getEnv().equalityTesters_ = []

// Unfortunately TestUtils.Simulate.keyDown(input, {key: 'Enter', keyCode: 13}) can't be used inside atom
global.dispatchKeyDownEvent = (el, opts = {}) => {
  // Chrome doesn't play well with keydown events
  // from https://code.google.com/p/chromium/issues/detail?id=327853&q=KeyboardEvent&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified
  var e = document.createEvent('Events')
  // KeyboardEvents bubble and are cancelable.
  // https://developer.mozilla.org/en-US/docs/Web/API/event.initEvent
  e.initEvent('keydown', true, true)
  e.keyCode = opts.keyCode
  el.dispatchEvent(e)
}
