/* @flow */

import * as React from "react";
import { fromEvent } from "rxjs";
import { takeUntil } from "rxjs/operators";

type Props = {
  listHeight: number,
  onResize: (listHeight: number) => any
};

export default class ResizeHandle extends React.Component<Props> {
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

    fromEvent(document, "mousemove")
      .pipe(takeUntil(fromEvent(document, "mouseup")))
      .subscribe(mouseMoveEvent => {
        const clientYdiff = mouseMoveEvent.clientY - initialClientY;
        this.props.onResize(listHeight + clientYdiff);
      });
  }
}
