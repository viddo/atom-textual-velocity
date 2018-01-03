/* @flow */

import * as React from "react";
import classNames from "classnames";
import type { ColumnHeader } from "../../flow-types/Column";
import type { SortDirection } from "sifter";

type Props = {
  column: ColumnHeader,
  sortDirection: SortDirection,
  sortField: string,
  onSortByField: Function,
  onChangeSortDirection: Function
};

export default class TableColumn extends React.Component<Props> {
  render() {
    const c = this.props.column;
    const isSelected = this._isSelected();
    return (
      <th
        style={{ width: `${c.width}%` }}
        className={classNames({ "is-selected": isSelected })}
        onClick={this._onClick.bind(this)}
      >
        {c.title}&nbsp;{this._sortIndicator(isSelected)}
      </th>
    );
  }

  _sortIndicator(isSelected: boolean) {
    if (isSelected) {
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
    if (this._isSelected()) {
      const direction = this.props.sortDirection === "asc" ? "desc" : "asc";
      this.props.onChangeSortDirection(direction);
    } else {
      this.props.onSortByField(this.props.column.sortField);
    }
  }

  _isSelected() {
    return this.props.sortField === this.props.column.sortField;
  }
}
