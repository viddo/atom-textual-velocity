Bacon = require("baconjs")

# Observe mouse move and provide callback functions to react accordingly
#
# @param mouseDownEvent: {Event} Initial event that should be called prior to starting to observe changes here
module.exports = (mouseDownEvent) ->
  mouseDoneStream = Bacon.fromEvent(document.body, "mouseup").merge(Bacon.fromEvent(document.body, "mouseleave"))
  mouseDoneStream.onValue ->
    return Bacon.noMore # to stop listening to events on both merged streams (mouseup/mouseleave)

  return Bacon.combineWith (initialEvent, moveEvent) ->
    clientX: moveEvent.clientX - initialEvent.clientX
    clientY: moveEvent.clientY - initialEvent.clientY
  , Bacon.constant(mouseDownEvent), Bacon.fromEvent(document.body, "mousemove").takeUntil(mouseDoneStream)
