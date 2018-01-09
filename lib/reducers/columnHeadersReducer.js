/* @flow */

import { name } from "../Columns";
import * as A from "../actions";
import type { Action } from "../actions";
import type { ColumnHeader } from "../flow-types/ColumnHeader";
import type { IColumns } from "../flow-types/IColumns";

export default function newColumnHeadersReducer(columns: IColumns) {
  const defaults = columns.map(c => ({
    sortField: c.sortField,
    title: c.title,
    width: c.width
  }));

  return function columnHeadersReducer(
    state: ColumnHeader[] = defaults,
    action: Action
  ) {
    switch (action.type) {
      case A.CHANGED_HIDDEN_COLUMNS: {
        const hiddenColumns = action.hiddenColumns;
        return defaults.filter(column => !hiddenColumns.includes(name(column)));
      }

      default:
        return state;
    }
  };
}
