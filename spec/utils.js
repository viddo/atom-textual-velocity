'use babel'
/* global UIEvent */

export default {

  dispatchEvent: (el, eventName, opts = {}) => {
    opts.view = opts.view || window
    if (opts.bubbles !== false) opts.bubbles = true
    if (opts.cancelable !== false) opts.cancelable = true
    el.dispatchEvent(new UIEvent(eventName, opts))
  },

  dispatchKeyEvent: (el, opts = {}) => {
    // dispatching key events are problematicin chrome, use the callbacks for now
    el[`on${opts.eventType}`]({
      keyCode: opts.keyCode,
      preventDefault: opts.preventDefault || () => {}
    })
  }
}
