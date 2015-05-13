Bacon = require('baconjs')

# Observe mouse move and provide callback functions to react accordingly
#
# @param initialEvent: {Event} Initial event that should be called prior to starting to observe changes here
module.exports = {

  mouseMoveDiff: (initialEvent) ->
    mouseUpStream = Bacon.fromEvent(document, 'mouseup')
    mouseUpStream.onValue -> Bacon.noMore # to stop listening to events
    return Bacon.fromEvent(document, 'mousemove')
      .takeUntil(mouseUpStream)
      .map (event) ->
        if event.which is 1 # left button
          clientX: event.clientX - initialEvent.clientX
          clientY: event.clientY - initialEvent.clientY
        else
          Bacon.noMore
}
