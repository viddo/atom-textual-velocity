/* @flow */

import { connect } from "react-redux";
import * as A from "../../actions";
import Cell from "../presentationals/Cell";

import type { Dispatch } from "redux";
import type { Action } from "../../actions";

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    onDoubleClick: (cell) => {
      if (typeof cell.editCellName === "string") {
        dispatch(A.editCell(cell.editCellName));
      }
    },
    onSave: (value) => {
      dispatch(A.editCellSave(value));
    },
    onAbort: () => {
      dispatch(A.editCellAbort());
    },
  };
};

export default connect(null, mapDispatchToProps)(Cell);
