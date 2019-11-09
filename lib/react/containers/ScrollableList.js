/* @flow */

import { connect } from "react-redux";
import * as A from "../../actions";
import ScrollableList from "../presentationals/ScrollableList";

import type { Dispatch } from "redux";
import type { Action } from "../../actions";
import type { State } from "../../../flow-types/State";

const mapStateToProps = (state: State) => {
  return {
    itemsCount: state.sifterResult.total,
    listHeight: state.listHeight,
    rowHeight: state.rowHeight,
    scrollTop: state.scrollTop
  };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    onScroll: scrollTop => {
      dispatch(A.scroll(scrollTop));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScrollableList);
