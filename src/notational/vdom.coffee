h     = require 'virtual-dom/h'
Bacon = require 'baconjs'

module.exports = {

  rootNode: (content, opts) ->
    h 'div.atom-notational-items', opts, content

  search: (inputBus, keydownBus) ->
    h 'input', {
      type: 'text'
      tabIndex: '-1'
      className: 'atom-notational-search native-key-bindings'
      placeholder: 'Search, or press enter to create a new untitled file'
      onkeydown: (ev) ->
        keydownBus.push ev
      oninput: (ev) ->
        inputBus.push ev
    }

  header: (columns) ->
    h 'div.header',
      h 'table',
        h 'thead',
          h 'tr', columns.map ({width, title}) =>
            @th width, title

  content: ({columns, reverseStripes, items, selectedItem}, selectItemBus) ->
    h 'table', [
      h 'thead.only-for-column-widths',
        h 'tr', columns.map ({width}) =>
          @th width
      h 'tbody', {
        className: 'is-reversed-stripes' if reverseStripes
      }, items.map (item) ->
        h 'tr', {
          className: 'is-selected' if item is selectedItem
          onclick: (ev) ->
            selectItemBus.push(item)
        }, columns.map ({cellContent}) ->
          h 'td', cellContent(item)
    ]

  th: (width, content = '') ->
    h 'th', {
      style:
        width: "#{width}%"
    }, content

  scrollableContent: ({bodyHeight, topOffset, scrollTop, marginBottom, content}, scrollTopBus) ->
    h 'div', {
      className: 'tbody'
      style: height: "#{bodyHeight}px"
      onscroll: (ev) -> scrollTopBus.push(ev.srcElement.scrollTop)
    }, h 'div.tinner-body', {
        style:
          height: "#{bodyHeight}px"
          top: "#{topOffset}px"
          marginTop: "#{scrollTop}px"
          marginBottom: "#{marginBottom}px"
      }, content

  resizeHandle: (bodyHeight, bodyHeightBus) ->
    h 'div.resize-handle', {
      onmousedown: (ev) =>
        @mouseMoveDiff(ev).onValue (diff) ->
          bodyHeightBus.push bodyHeight + diff.clientY
    }

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
