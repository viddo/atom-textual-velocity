/* @flow */

import { name } from "../Columns";
import * as A from "../actions";
import columns from "../Columns";
import type { Action } from "../actions";
import type { ColumnHeader } from "../flow-types/ColumnHeader";

const defaults = columns.map(c => ({
  sortField: c.sortField,
  title: c.title,
  width: c.width
}));

export default function columnHeadersReducer(
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
}
