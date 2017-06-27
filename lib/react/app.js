/* @flow */

import * as allActionCreators from "../action-creators";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Main from "./main";
import paginationSelector from "../reselectors/pagination";
import makeVisibleRowsSelector from "../reselectors/visible-rows";

const actionCreators = Object.keys(allActionCreators).reduce((obj, key) => {
  if (typeof allActionCreators[key] === "function") {
    obj[key] = allActionCreators[key];
  }
  return obj;
}, {});

export default function makeApp(columns: Columns) {
  const visibleRowsSelector = makeVisibleRowsSelector(
    columns,
    paginationSelector
  );

  function mapStateToProps(state: State): MainPropsWithoutActions {
    const filenames = Object.keys(state.notes);

    return {
      columnHeaders: state.columnHeaders,
      editCellName: state.editCellName,
      initialScanDone: !!state.initialScan.done,
      initialScanFilesCount: state.initialScan.rawFiles.length,
      itemsCount: state.sifterResult.total,
      listHeight: state.listHeight,
      paginationStart: paginationSelector(state).start,
      queryOriginal: state.queryOriginal,
      readyCount: filenames.reduce((memo, filename) => {
        return state.notes[filename].ready ? memo + 1 : memo;
      }, 0),
      rowHeight: state.rowHeight,
      scrollTop: state.scrollTop,
      sortDirection: state.sifterResult.options.sort[0].direction,
      sortField: state.sifterResult.options.sort[0].field,
      totalCount: filenames.length,
      visibleRows: visibleRowsSelector(state)
    };
  }

  function mapDispatchToProps(dispatch: Dispatch): MainPropsActions {
    return { actions: bindActionCreators(actionCreators, dispatch) };
  }

  return connect(mapStateToProps, mapDispatchToProps)(Main);
}
