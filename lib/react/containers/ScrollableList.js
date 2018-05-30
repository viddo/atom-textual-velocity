/* @flow */

import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";
import * as A from "../../actions";
import ScrollableList from "../presentationals/ScrollableList";
import type { Action } from "../../actions";
import type { State } from "../../flow-types/State";

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScrollableList);
