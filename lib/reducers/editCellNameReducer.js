/* @flow */

import * as A from "../actions";
import columns from "../Columns";
import type { Action } from "../actions";
import type { EditCellName } from "../flow-types/EditCellName";

export default function editCellNameReducer(
  state: EditCellName = null,
  action: Action
) {
  switch (action.type) {
    case A.EDIT_CELL: {
      const editCellName = action.name;
      return columns.some(c => c.editCellName === editCellName)
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
}
