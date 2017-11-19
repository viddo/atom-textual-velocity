/* @flow */

import * as C from "../action-constants";

export default function newEditCellNameReducer(columns: Columns) {
  return function editCellNameReducer(
    state: EditCellName = null,
    action: Action
  ) {
    switch (action.type) {
      case C.EDIT_CELL:
        const editCellName = action.name;
        return columns.some(column => column.editCellName === editCellName)
          ? editCellName
          : null;

      case C.EDIT_CELL_ABORT:
        return null;

      case C.EDIT_CELL_SAVE:
        return null;

      default:
        return state;
    }
  };
}
