/* @flow */

import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps } from "react-redux";
import * as A from "../../action-creators";
import CellEditor from "../presentationals/cell-editor";

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
