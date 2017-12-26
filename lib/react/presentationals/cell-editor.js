/* @flow */

import React from "react";

type Props = {
  initialVal: string,
  onAbort: () => any,
  onSave: (value: string) => any
};

type State = {
  value: string
};

export default class CellEditor extends React.Component<Props, State> {
  input: ?HTMLInputElement;

  _onKeyPress: (ev: KeyboardEvent) => void;

  constructor(props: Props) {
    super(props);
    this.state = { value: props.initialVal };

    this._onKeyPress = ev => {
      if (ev.keyCode === 13) {
        // <enter>
        this._saveIfChangedOrAbort();
      } else if (ev.keyCode === 27) {
        // <esc>
        this.props.onAbort();
      }
    };
  }

  render() {
    return (
      <td className="edit-cell-str">
        <input
          type="text"
          className="tv-input native-key-bindings"
          ref={input => {
            this.input = input;
          }}
          value={this.state.value}
          onChange={this._onChange.bind(this)}
          onBlur={this._saveIfChangedOrAbort.bind(this)}
        />
      </td>
    );
  }

  componentDidMount() {
    if (this.input) {
      this.input.addEventListener("keydown", this._onKeyPress);
    }
    if (this.input) {
      this.input.select();
    }
    if (this.input) {
      this.input.focus();
    }
  }

  componentWillUnmount() {
    if (this.input) {
      this.input.removeEventListener("keydown", this._onKeyPress);
    }
  }

  _onChange(ev: any) {
    this.setState({ value: ev.target.value });
  }

  _saveIfChangedOrAbort() {
    if (this._hasChanged()) {
      this.props.onSave(this.state.value.trim());
    } else {
      this.props.onAbort();
    }
  }

  _hasChanged() {
    return (
      this.state.value !== this.props.initialVal &&
      this.state.value.trim() !== this.props.initialVal
    );
  }
}
