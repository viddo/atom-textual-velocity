/* @flow */

import React from "react";
import { Observable } from "rxjs";

export default class ResizeHandle extends React.Component {
  props: {
    listHeight: number,
    onResize: Function
  };

  render() {
    return (
      <div
        className="resize-handle"
        onMouseDown={this._onMouseDown.bind(this)}
      />
    );
  }

  _onMouseDown(mouseDownEvent: MouseEvent) {
    if (mouseDownEvent.button !== 0) return; // only allow to resize on left-click

    const listHeight = this.props.listHeight;
    const initialClientY = mouseDownEvent.clientY;

    Observable.fromEvent(document, "mousemove")
      .takeUntil(Observable.fromEvent(document, "mouseup"))
      .subscribe(mouseMoveEvent => {
        const clientYdiff = mouseMoveEvent.clientY - initialClientY;
        this.props.onResize(listHeight + clientYdiff);
      });
  }
}
