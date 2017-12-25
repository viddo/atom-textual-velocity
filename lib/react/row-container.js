/* @flow */

import * as A from "../action-creators";
import { connect } from "react-redux";
import Row from "./row";
import type { Dispatch } from "redux";
import type { MapDispatchToProps } from "react-redux";

const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
  dispatch: Dispatch<Action>
) => {
  return {
    onClick: row => {
      dispatch(A.selectNote(row.filename));
    }
  };
};

export default connect(null, mapDispatchToProps)(Row);
