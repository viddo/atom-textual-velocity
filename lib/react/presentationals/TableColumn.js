/* @flow */

import * as React from "react";
import classNames from "classnames";

import type { SortDirection } from "../../../flow-types/SortDirection";
import type { ColumnHeader } from "../../../flow-types/ColumnHeader";

type Props = {
  column: ColumnHeader,
  sortDirection: SortDirection,
  sortField: string,
  onClickColumn: (sortField: string) => void
};

export default class TableColumn extends React.Component<Props> {
  render() {
    const { column, sortDirection } = this.props;
    const isSelected = column.sortField === this.props.sortField;
    return (
      <th
        style={{ width: `${column.width}%` }}
        className={classNames({ "is-selected": isSelected })}
        onClick={this._onClick.bind(this)}
      >
        {column.title}
        &nbsp;
        <span
          className={classNames({
            icon: true,
            "is-hidden": !isSelected,
            "icon-triangle-up": sortDirection === "asc",
            "icon-triangle-down": sortDirection === "desc"
          })}
        />
      </th>
    );
  }

  _onClick() {
    this.props.onClickColumn(this.props.column.sortField);
  }
}
