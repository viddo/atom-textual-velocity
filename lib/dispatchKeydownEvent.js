/* @flow */

// Unfortunately TestUtils.Simulate.keyDown(input, {key: 'Enter', keyCode: 13}) can't be used inside atom
export default function dispatchKeyDownEvent(el: any, opts: Object = {}) {
  if (!el) throw new Error("el is missing!");

  // Chrome doesn't play well with keydown events
  // from https://code.google.com/p/chromium/issues/detail?id=327853&q=KeyboardEvent&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified
  var e: any = document.createEvent("Events");
  // KeyboardEvents bubble and are cancelable.
  // https://developer.mozilla.org/en-US/docs/Web/API/event.initEvent
  e.initEvent("keydown", true, true);
  e.keyCode = opts.keyCode;
  el.dispatchEvent(e);
}
