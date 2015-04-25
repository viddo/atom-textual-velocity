h = require 'virtual-dom/h'
row = require './row'

module.exports = (data, buses) ->
  { items, bodyHeight, topOffset, scrollTop, marginBottom, reverseStripes } = data
  { scrollTopBus } = buses
  bodyClassNames = ['tbody']
  bodyClassNames.push('is-reversed-stripes') if reverseStripes

  return  h 'div', {
    className: bodyClassNames.join(' ')
    style: height: "#{bodyHeight}px"
    onscroll: (ev) -> scrollTopBus.push(ev.srcElement.scrollTop)
  }, h 'div.tinner-body', {
      style:
        height: "#{bodyHeight}px"
        top: "#{topOffset}px"
        marginTop: "#{scrollTop}px"
        marginBottom: "#{marginBottom}px"
    }, items.map (item) ->
      row(item, data, buses)
