/* @flow */

import {React} from 'react-for-atom'
import Bacon from 'baconjs'

export default class ResizeHandle extends React.Component {

  props: {
    listHeight: number,
    onResize: Function
  }

  render () {
    return (
      <div className='resize-handle' onMouseDown={this._onMouseDown.bind(this)} />
    )
  }

  _onMouseDown (ev: MouseEvent) {
    const listHeight = this.props.listHeight
    this._mouseMoveDiff(ev.clientY).onValue(clientYdiff =>
      this.props.onResize(listHeight + clientYdiff)
    )
  }

  // Observe mouse move and provide callback functions to react accordingly
  // @param {Event} initialEvent mousedown event that should trigger this observer
  // @return {Stream} containing an object w/ clientX/Y values, diffing with the {initialEvent} mouse position
  //  Stream stops when a mouse-up event is triggered on the document.
  _mouseMoveDiff (initialClientY: number) {
    const mouseUpS = Bacon.fromEvent(document, 'mouseup')
    mouseUpS.onValue(() => Bacon.noMore) // to stop listening to events

    return Bacon.fromEvent(document, 'mousemove')
      .takeUntil(mouseUpS)
      .map(event => {
        return event.which === 1 // left button
          ? event.clientY - initialClientY
          : Bacon.noMore
      })
  }

}
