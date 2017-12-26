/* @flow */

import classNames from "classnames";
import React from "react";
import Cell from "./containers/cell";

type Props = {
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
        {row.cells.map((cell, i) => <Cell key={i} cell={cell} />)}
      </tr>
    );
  }
}
