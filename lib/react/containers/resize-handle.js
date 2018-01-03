/* @flow */

import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";
import * as A from "../../actions";
import ResizeHandle from "../presentationals/resize-handle";
import type { Action } from "../../actions";
import type { State } from "../../flow-types/state";

const mapStateToProps: MapStateToProps<State, *, *> = (state: State) => {
  return {
    listHeight: state.listHeight
  };
};

const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
  dispatch: Dispatch<Action>
) => {
  return {
    onResize: listHeight => {
      dispatch(A.resizeList(listHeight));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResizeHandle);
