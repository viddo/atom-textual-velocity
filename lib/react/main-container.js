/* @flow */

import * as actionCreators from "../action-creators";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Main from "./main";
import paginationSelector from "../reselectors/pagination";
import newVisibleRowsSelector from "../reselectors/visible-rows";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";

export default function newApp(columns: Columns) {
  const visibleRowsSelector = newVisibleRowsSelector(
    columns,
    paginationSelector
  );

  const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
    return {
      columnHeaders: state.columnHeaders,
      editCellName: state.editCellName,
      loading: state.loading,
      paginationStart: paginationSelector(state).start,
      sortDirection: state.sifterResult.options.sort[0].direction,
      sortField: state.sifterResult.options.sort[0].field,
      visibleRows: visibleRowsSelector(state)
    };
  };

  const mapDispatchToProps: MapDispatchToProps<*, *, *> = (
    dispatch: Dispatch
  ) => {
    return { actions: bindActionCreators(actionCreators, dispatch) };
  };

  return connect(mapStateToProps, mapDispatchToProps)(Main);
}
