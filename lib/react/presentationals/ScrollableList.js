/* @flow */

import * as React from "react";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

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
  scrolling: boolean
};

export default class ScrollableList extends React.Component<Props, State> {
  _resetScrollingStateSubject: rxjs$Subject<void> | void | null;
  _resetScrollingStateSubscription: rxjs$Subscription | void | null;
  _list: { current: null | React$ElementRef<"div"> };

  constructor(props: Props) {
    super(props);
    this.state = {
      scrolling: false
    };
    this._list = React.createRef();
  }

  render() {
    return (
      <div
        ref={this._list}
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

  componentDidMount() {
    this._resetScrollingStateSubject = new Subject();
    this._resetScrollingStateSubscription = this._resetScrollingStateSubject
      .pipe(debounceTime(400))
      .subscribe(() => {
        this.setState({ scrolling: false });
      });
  }

  componentDidUpdate() {
    if (this.state.scrolling) return;

    const { current } = this._list;
    if (current && current.scrollTop !== this.props.scrollTop) {
      current.scrollTop = this.props.scrollTop;
    }
  }

  compomentWillUnmount() {
    if (this._resetScrollingStateSubject) {
      this._resetScrollingStateSubject = null;
    }
    if (this._resetScrollingStateSubscription) {
      this._resetScrollingStateSubscription.unsubscribe();
    }
  }

  _onScroll(ev: any) {
    const scrollTop = ev.target.scrollTop;

    if (!this._isForcedScroll(scrollTop)) {
      if (!this.state.scrolling) {
        this.setState({ scrolling: true });
      }

      this.props.onScroll(scrollTop);

      if (this._resetScrollingStateSubject) {
        this._resetScrollingStateSubject.next();
      }
    }
  }

  _isForcedScroll(scrollTop: number) {
    return scrollTop === this.props.scrollTop;
  }
}
