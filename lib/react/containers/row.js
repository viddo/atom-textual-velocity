/* @flow */

import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps } from "react-redux";
import * as A from "../../action-creators";
import Row from "../presentationals/row";

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
