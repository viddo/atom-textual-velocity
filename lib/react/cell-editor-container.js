/* @flow */

import * as A from "../action-creators";
import { connect } from "react-redux";
import CellEditor from "./cell-editor";
import type { Dispatch } from "redux";
import type { MapDispatchToProps } from "react-redux";

const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
  dispatch: Dispatch<Action>
) => {
  return {
    onSave: value => {
      dispatch(A.editCellSave(value));
    },
    onAbort: () => {
      dispatch(A.editCellAbort());
    }
  };
};

export default connect(null, mapDispatchToProps)(CellEditor);
