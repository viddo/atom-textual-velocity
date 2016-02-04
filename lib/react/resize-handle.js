'use babel'

import {React} from 'react-for-atom'
import Bacon from 'baconjs'

export default React.createClass({

  propTypes: {
    panelHeightBus: React.PropTypes.object,
    panelHeight: React.PropTypes.number
  },

  render () {
    return (
      <div className='resize-handle' onMouseDown={this._onMouseDown} />
    )
  },

  _onMouseDown (ev) {
    const panelHeight = this.props.panelHeight
    this._mouseMoveDiff(ev.clientY).onValue(clientYdiff =>
      this.props.panelHeightBus.push(panelHeight + clientYdiff)
    )
  },

  // Observe mouse move and provide callback functions to react accordingly
  // @param {Event} initialEvent mousedown event that should trigger this observer
  // @return {Stream} containing an object w/ clientX/Y values, diffing with the {initialEvent} mouse position
  //  Stream stops when a mouse-up event is triggered on the document.
  _mouseMoveDiff (initialClientY) {
    const mouseUpStream = Bacon.fromEvent(document, 'mouseup')
    mouseUpStream.onValue(() => Bacon.noMore) // to stop listening to events

    return Bacon.fromEvent(document, 'mousemove')
      .takeUntil(mouseUpStream)
      .map(event => {
        return event.which === 1 // left button
          ? event.clientY - initialClientY
          : Bacon.noMore
      })
  }

})
