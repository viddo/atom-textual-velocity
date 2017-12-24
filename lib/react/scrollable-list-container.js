/* @flow */

import * as A from "../action-creators";
import { connect } from "react-redux";
import ScrollableList from "./scrollable-list";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";

const mapStateToProps: MapStateToProps<State, *, *> = (state: State) => {
  return {
    itemsCount: state.sifterResult.total,
    listHeight: state.listHeight,
    rowHeight: state.rowHeight,
    scrollTop: state.scrollTop
  };
};

const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
  dispatch: Dispatch<Action>
) => {
  return {
    onScroll: scrollTop => {
      dispatch(A.scroll(scrollTop));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScrollableList);
