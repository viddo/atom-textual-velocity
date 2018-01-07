/* @flow */

import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps } from "react-redux";
import * as A from "../../actions";
import Row from "../presentationals/Row";
import type { Action } from "../../actions";

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
