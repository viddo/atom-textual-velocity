/* @flow */

import * as React from "react";
import { fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";

type Props = {
  children?: React.Node,
  onResize: (clientHeight: number) => any,
};

export default class Panel extends React.Component<Props> {
  _resizeSubscription: rxjs$Subscription | void | null;
  _node: null | HTMLDivElement;

  render() {
    return (
      <div
        className="textual-velocity"
        ref={(node) => {
          this._node = node;
        }}
      >
        {this.props.children}
      </div>
    );
  }

  componentDidMount() {
    this._resizeSubscription = fromEvent(window, "resize")
      .pipe(debounceTime(50))
      .subscribe(() => {
        if (this._node) {
          const td = this._node.querySelector("td");
          if (td && td.clientHeight > 0) {
            this.props.onResize(td.clientHeight);
          }
        }
      });
  }

  componentWillUnmount() {
    if (this._resizeSubscription) {
      this._resizeSubscription.unsubscribe();
    }
    this._resizeSubscription = null;
  }
}
