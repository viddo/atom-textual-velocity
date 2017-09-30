/* @flow */

import Disposables from "../disposables";
import React from "react";
import ReactDOM from "react-dom";
import { Subject } from "rxjs";

const IS_INPUT_ELEMENT_REGEX = /INPUT|ATOM-TEXT-EDITOR/;

const privates = new WeakMap();

type Props = {
  focusOnEvents: boolean,
  query: string,
  onKeyPress: Function,
  onSearch: Function
};

export default class Search extends React.Component<Props> {
  componentWillMount() {
    const focusInputSubject = new Subject();
    const focusInputSubscription = focusInputSubject
      .debounceTime(50)
      .subscribe((force: boolean) => {
        const shouldFocus =
          force ||
          (this.props.focusOnEvents &&
            document.activeElement &&
            !IS_INPUT_ELEMENT_REGEX.test(document.activeElement.tagName));

        if (shouldFocus) {
          const el = ReactDOM.findDOMNode(this);
          if (
            el &&
            el instanceof HTMLInputElement &&
            el !== document.activeElement
          ) {
            el.select();
            el.focus();
          }
        }
      });

    privates.set(this, {
      focusInputSubject,
      focusInputSubscription,
      disposables: new Disposables(),
      onKeyPress: (ev: KeyboardEvent) => this.props.onKeyPress(ev)
    });
  }

  render() {
    return (
      <input
        type="text"
        value={this.props.query}
        className="tv-input tv-input--search native-key-bindings"
        placeholder="Search, or press enter to create a new untitled file"
        onChange={ev => this.props.onSearch(ev.target.value)}
      />
    );
  }

  componentDidMount() {
    const { disposables, focusInputSubject, onKeyPress } =
      privates.get(this) || {};

    focusInputSubject.next(false);

    disposables.add(
      atom.commands.add(
        "atom-workspace",
        "textual-velocity:focus-on-search",
        () => focusInputSubject.next(true)
      ),
      atom.commands.add(
        "atom-workspace",
        "textual-velocity:toggle-atom-window",
        () => focusInputSubject.next(true)
      ),
      atom.commands.add("atom-workspace", "textual-velocity:toggle-panel", () =>
        focusInputSubject.next(true)
      )
    );

    // An evil necessary, due to https://github.com/atom/atom/blob/8eaaf40a2cffd9e091a420ca0634c9da9cf4b544/src/window-event-handler.coffee#L77
    // that prevents keydown events to propagate to React's event handler
    const el = ReactDOM.findDOMNode(this);
    if (el && el instanceof HTMLElement) {
      el.addEventListener("keydown", onKeyPress);
    }
  }

  componentDidUpdate() {
    const { focusInputSubject } = privates.get(this) || {};
    focusInputSubject.next(false);
  }

  componentWillUnmount() {
    const { disposables, onKeyPress, focusInputSubscription } =
      privates.get(this) || {};

    focusInputSubscription.unsubscribe();
    disposables.dispose();

    const el = ReactDOM.findDOMNode(this);
    if (el && el instanceof HTMLElement) {
      el.removeEventListener("keydown", onKeyPress);
    }

    privates.delete(this);
  }
}
