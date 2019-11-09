/* @flow */

import { connect } from "react-redux";
import * as A from "../../actions";
import ResizeHandle from "../presentationals/ResizeHandle";

import type { Dispatch } from "redux";
import type { Action } from "../../actions";
import type { State } from "../../../flow-types/State";

const mapStateToProps = (state: State) => {
  return {
    listHeight: state.listHeight
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    onResize: listHeight => {
      dispatch(A.resizeList(listHeight));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResizeHandle);
