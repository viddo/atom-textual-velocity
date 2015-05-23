Bacon = require 'baconjs'

module.exports = {

  # Observe mouse move and provide callback functions to react accordingly
  #
  # @param {Event} initialEvent mousedown event that should trigger this observer
  # @return {Stream} containing an object w/ clientX/Y values, diffing with the {initialEvent} mouse position
  #   Stream stops when a mouse-up event is triggered on the document.
  mouseMoveDiff: (initialEvent) ->
    mouseUpStream = Bacon.fromEvent(document, 'mouseup')
    mouseUpStream.onValue -> Bacon.noMore # to stop listening to events
    Bacon.fromEvent(document, 'mousemove')
      .takeUntil(mouseUpStream)
      .map (event) ->
        if event.which is 1 # left button
          clientX: event.clientX - initialEvent.clientX
          clientY: event.clientY - initialEvent.clientY
        else
          Bacon.noMore
}
