module.exports = {
  dispatchEvent: (el, eventName, opts = {}) ->
    opts.view ||= window
    if opts.bubbles isnt false then opts.bubbles = true
    if opts.cancelable isnt false then opts.cancelable = true
    el.dispatchEvent new UIEvent(eventName, opts)

  dispatchKeyEvent: (el, opts = {}) ->
    # dispatching key events are problematicin chrome, use the callbacks for now
    el["on#{opts.eventType}"](
      keyCode: opts.keyCode
      preventDefault: opts.preventDefault || ->
    )
}
