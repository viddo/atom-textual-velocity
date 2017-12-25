/* @flow */

import * as A from "../action-creators";
import { connect } from "react-redux";
import Cell from "./cell";
import type { Dispatch } from "redux";
import type { MapDispatchToProps } from "react-redux";

const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
  dispatch: Dispatch<Action>
) => {
  return {
    onDoubleClick: cell => {
      if (typeof cell.editCellName === "string") {
        dispatch(A.editCell(cell.editCellName));
      }
    }
  };
};

export default connect(null, mapDispatchToProps)(Cell);
