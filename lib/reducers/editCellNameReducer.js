/* @flow */

import * as A from "../actions";
import type { Action } from "../actions";
import type { Columns } from "../flow-types/Column";
import type { EditCellName } from "../flow-types/EditCellName";

export default function newEditCellNameReducer(columns: Columns) {
  return function editCellNameReducer(
    state: EditCellName = null,
    action: Action
  ) {
    switch (action.type) {
      case A.EDIT_CELL: {
        const editCellName = action.name;
        return columns.some(column => column.editCellName === editCellName)
          ? editCellName
          : null;
      }

      case A.EDIT_CELL_ABORT:
        return null;

      case A.EDIT_CELL_SAVE:
        return null;

      default:
        return state;
    }
  };
}
