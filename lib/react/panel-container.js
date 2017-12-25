/* @flow */

import * as A from "../action-creators";
import { connect } from "react-redux";
import Panel from "./panel";
import paginationSelector from "../reselectors/pagination";
import newVisibleRowsSelector from "../reselectors/visible-rows";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";

export default function newPanelContainer(columns: Columns) {
  const visibleRowsSelector = newVisibleRowsSelector(
    columns,
    paginationSelector
  );

  const mapStateToProps: MapStateToProps<State, *, *> = (state: State) => {
    return {
      columnHeaders: state.columnHeaders,
      loading: state.loading,
      paginationStart: paginationSelector(state).start,
      visibleRows: visibleRowsSelector(state)
    };
  };

  const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
    dispatch: Dispatch<Action>
  ) => {
    return {
      onResize: clientHeight => {
        dispatch(A.changeRowHeight(clientHeight));
      }
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(Panel);
}
