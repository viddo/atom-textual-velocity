/* @flow */

import classNames from "classnames";
import * as React from "react";

import type { ColumnHeader } from "../../../flow-types/ColumnHeader";

type Props = {
  children?: React.Node,
  columnHeaders: ColumnHeader[],
  paginationStart: number
};

export default class Rows extends React.Component<Props> {
  render() {
    return (
      <table>
        <thead className="only-for-column-widths">
          <tr>
            {this.props.columnHeaders.map(c => (
              <th key={c.title} style={{ width: `${c.width}%` }} />
            ))}
          </tr>
        </thead>
        <tbody
          className={classNames({
            "is-reversed-stripes": this.props.paginationStart % 2 === 1
          })}
        >
          {this.props.children}
        </tbody>
      </table>
    );
  }
}
