/* @flow */

import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps } from "react-redux";
import * as A from "../../action-creators";
import Cell from "../presentationals/cell";

const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
  dispatch: Dispatch<Action>
) => {
  return {
    onDoubleClick: cell => {
      if (typeof cell.editCellName === "string") {
        dispatch(A.editCell(cell.editCellName));
      }
    },
    onSave: value => {
      dispatch(A.editCellSave(value));
    },
    onAbort: () => {
      dispatch(A.editCellAbort());
    }
  };
};

export default connect(null, mapDispatchToProps)(Cell);
