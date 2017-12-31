/* @flow */

import { name } from "../columns";
import * as C from "../action-constants";

export default function newColumnHeadersReducer(columns: Columns) {
  const defaults = columns.map(c => ({
    sortField: c.sortField,
    title: c.title,
    width: c.width
  }));

  return function columnHeadersReducer(
    state: Array<ColumnHeader> = defaults,
    action: Action
  ) {
    switch (action.type) {
      case C.CHANGED_HIDDEN_COLUMNS: {
        const hiddenColumns = action.hiddenColumns;
        return defaults.filter(column => !hiddenColumns.includes(name(column)));
      }

      default:
        return state;
    }
  };
}
