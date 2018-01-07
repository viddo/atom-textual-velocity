/* @flow */

import classNames from "classnames";
import * as React from "react";
import type { NoteRow } from "../../flow-types/Note";

type Props = {
  children?: React.Node,
  row: NoteRow,
  onClick: (row: NoteRow) => any
};

export default class Row extends React.Component<Props> {
  render() {
    const { row } = this.props;
    return (
      <tr
        onClick={() => {
          this.props.onClick(row);
        }}
        className={classNames({ "is-selected": row.selected })}
      >
        {this.props.children}
      </tr>
    );
  }
}
