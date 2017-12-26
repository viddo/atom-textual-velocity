/* @flow */

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";
import * as A from "../../action-creators";
import ResizeHandle from "../presentationals/resize-handle";

const mapStateToProps: MapStateToProps<State, *, *> = (state: State) => {
  return {
    listHeight: state.listHeight
  };
};

const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
  dispatch: Dispatch<Action>
) => {
  const actionCreators = {
    onResize: A.resizeList
  };
  return bindActionCreators(actionCreators, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ResizeHandle);
