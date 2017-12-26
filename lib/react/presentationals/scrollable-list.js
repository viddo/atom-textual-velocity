/* @flow */

import React from "react";
import ReactDOM from "react-dom";
import { Subject } from "rxjs";

type Props = {
  children?: any,
  scrollTop: number,
  itemsCount: number,
  listHeight: number,
  onScroll: Function,
  paginationStart: number,
  rowHeight: number
};

type State = {
  forcedScroll: boolean,
  scrolling: boolean
};

export default class ScrollableList extends React.Component<Props, State> {
  _resetScrollingStateSubject: rxjs$Subject<void> | void | null;
  _resetScrollingStateSubscription: rxjs$Subscription | void | null;
  _resetForcedScrollSubject: rxjs$Subject<void> | void | null;
  _resetForcedScrollSubscription: rxjs$Subscription | void | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      forcedScroll: false,
      scrolling: false
    };
  }

  componentWillMount() {
    this._resetScrollingStateSubject = new Subject();
    this._resetScrollingStateSubscription = this._resetScrollingStateSubject
      .debounceTime(400)
      .subscribe(() => {
        this.setState({ scrolling: false });
      });

    this._resetForcedScrollSubject = new Subject();
    this._resetForcedScrollSubscription = this._resetForcedScrollSubject
      .debounceTime(100)
      .subscribe(() => {
        this.setState({ forcedScroll: false });
      });
  }

  render() {
    return (
      <div
        onScroll={this._onScroll.bind(this)}
        style={{
          height: this.props.listHeight,
          overflowY: "scroll"
        }}
      >
        <div
          style={{
            position: "relative",
            height: this.props.rowHeight * this.props.itemsCount, // full height

            // Disable pointer-events for smooth scrolling to work as expected
            // From https://github.com/facebook/react/issues/2295#issuecomment-104944111
            pointerEvents: this.state.scrolling ? "none" : "auto"
          }}
        >
          <div
            style={{
              // Position current results chunk within the list based on its pagination start
              top: this.props.rowHeight * this.props.paginationStart,
              position: "relative"
            }}
          >
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }

  componentWillReceiveProps(nextProps: Props) {
    // If next scrollTop value doesn't match current it means it's a "forced scroll" from somewhere else
    // So indicate this to avoid pushing additional scroll
    // Will be reset after the debounce
    const el = ReactDOM.findDOMNode(this);
    if (el && el.scrollTop !== nextProps.scrollTop) {
      this.setState({ forcedScroll: true });

      if (this._resetForcedScrollSubject) {
        this._resetForcedScrollSubject.next();
      }
    }
  }

  componentDidUpdate() {
    const el = ReactDOM.findDOMNode(this);
    if (
      !this.state.scrolling &&
      el &&
      el instanceof HTMLElement &&
      el.scrollTop !== this.props.scrollTop
    ) {
      el.scrollTop = this.props.scrollTop;
    }
  }

  compomentWillUnmount() {
    if (this._resetForcedScrollSubject) {
      this._resetForcedScrollSubject = null;
    }
    if (this._resetForcedScrollSubscription) {
      this._resetForcedScrollSubscription.unsubscribe();
    }
    if (this._resetScrollingStateSubject) {
      this._resetScrollingStateSubject = null;
    }
    if (this._resetScrollingStateSubscription) {
      this._resetScrollingStateSubscription.unsubscribe();
    }
  }

  _onScroll(ev: any) {
    if (!this.state.forcedScroll) {
      if (!this.state.scrolling) {
        this.setState({ scrolling: true });
      }

      this.props.onScroll(ev.target.scrollTop);

      if (this._resetScrollingStateSubject) {
        this._resetScrollingStateSubject.next();
      }
    }
  }
}
