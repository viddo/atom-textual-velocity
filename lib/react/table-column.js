/* @flow */

import React from "react";
import classNames from "classnames";

type Props = {
  column: ColumnHeader,
  isSelected: boolean,
  sortDirection: SortDirection,
  onSortByField: Function,
  onChangeSortDirection: Function
};

export default class TableColumn extends React.Component<Props> {
  render() {
    const c = this.props.column;
    return (
      <th
        style={{ width: `${c.width}%` }}
        className={classNames({ "is-selected": this.props.isSelected })}
        onClick={this._onClick.bind(this)}
      >
        {c.title}&nbsp;{this._sortIndicator()}
      </th>
    );
  }

  _sortIndicator() {
    if (this.props.isSelected) {
      return (
        <span
          className={classNames({
            icon: true,
            "icon-triangle-up": this.props.sortDirection === "asc",
            "icon-triangle-down": this.props.sortDirection === "desc"
          })}
        />
      );
    }
  }

  _onClick() {
    if (this.props.isSelected) {
      const direction = this.props.sortDirection === "asc" ? "desc" : "asc";
      this.props.onChangeSortDirection(direction);
    } else {
      this.props.onSortByField(this.props.column.sortField);
    }
  }
}
