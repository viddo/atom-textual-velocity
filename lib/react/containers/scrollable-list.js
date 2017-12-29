/* @flow */

import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";
import * as A from "../../action-creators";
import ScrollableList from "../presentationals/scrollable-list";

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
