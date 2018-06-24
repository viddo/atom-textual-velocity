/* @flow */

import * as React from "react";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import Disposables from "../../Disposables";

const IS_INPUT_ELEMENT_REGEX = /INPUT|ATOM-TEXT-EDITOR/;

type Props = {
  focusOnEvents: boolean,
  query: string,
  onKeyPress: Function,
  onSearch: Function
};

export default class Search extends React.Component<Props> {
  _focusInputSubject: rxjs$Subject<boolean>;
  _focusInputSubscription: rxjs$Subscription;
  _disposables: Disposables;
  _node: null | HTMLInputElement;

  render() {
    return (
      <input
        ref={node => {
          this._node = node;
        }}
        type="text"
        value={this.props.query}
        className="tv-input tv-input--search native-key-bindings"
        placeholder="Search, or press enter to create a new untitled file"
        onChange={ev => this.props.onSearch(ev.target.value)}
      />
    );
  }

  componentDidMount() {
    this._disposables = new Disposables();
    this._focusInputSubject = new Subject();

    this._focusInputSubscription = this._focusInputSubject
      .pipe(debounceTime(50))
      .subscribe((force: boolean) => {
        const shouldFocus =
          force ||
          (this.props.focusOnEvents &&
            document.activeElement &&
            !IS_INPUT_ELEMENT_REGEX.test(document.activeElement.tagName));

        if (
          shouldFocus &&
          this._node &&
          this._node !== document.activeElement
        ) {
          this._node.select();
          // $FlowFixMe if it works for select
          this._node.focus();
        }
      });

    this._focusInputSubject.next(false);

    this._disposables.add(
      atom.commands.add(
        "atom-workspace",
        "textual-velocity:focus-on-search",
        () => this._focusInputSubject.next(true)
      ),
      atom.commands.add(
        "atom-workspace",
        "textual-velocity:toggle-atom-window",
        () => this._focusInputSubject.next(true)
      ),
      atom.commands.add("atom-workspace", "textual-velocity:toggle-panel", () =>
        this._focusInputSubject.next(true)
      )
    );

    // An evil necessary, due to https://github.com/atom/atom/blob/8eaaf40a2cffd9e091a420ca0634c9da9cf4b544/src/window-event-handler.coffee#L77
    // that prevents keydown events to propagate to React's event handler
    if (this._node) {
      this._node.addEventListener("keydown", this.props.onKeyPress);
    }
  }

  componentDidUpdate() {
    this._focusInputSubject.next(false);
  }

  componentWillUnmount() {
    this._focusInputSubscription.unsubscribe();
    this._disposables.dispose();

    if (this._node) {
      this._node.removeEventListener("keydown", this.props.onKeyPress);
    }
  }
}
