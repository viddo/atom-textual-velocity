/* @flow */

import * as React from "react";
import ReactDOM from "react-dom";
import { Observable } from "rxjs";

type Props = {
  children?: React.Node,
  onResize: (clientHeight: number) => any
};

export default class Panel extends React.Component<Props> {
  _resizeSubscription: rxjs$Subscription | void | null;

  render() {
    return <div className="textual-velocity">{this.props.children}</div>;
  }

  componentDidMount() {
    this._resizeSubscription = Observable.fromEvent(window, "resize")
      .debounceTime(50)
      .subscribe(() => {
        const el = ReactDOM.findDOMNode(this);
        if (el && el instanceof HTMLElement) {
          const td = el.querySelector("td");
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
