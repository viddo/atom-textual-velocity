/* @flow */

import * as A from "../action-creators";
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
      visibleRows: visibleRowsSelector(state)
    };
  };

  const mapDispatchToProps: MapDispatchToProps<*, *, *> = (
    dispatch: Dispatch
  ) => {
    const actionCreators = {
      onClickRow: A.selectNote,
      onEditCell: A.editCell,
      onEditCellSave: A.editCellSave,
      onEditCellAbort: A.editCellAbort,
      onResize: A.changeRowHeight
    };
    return bindActionCreators(actionCreators, dispatch);
  };

  return connect(mapStateToProps, mapDispatchToProps)(Main);
}
