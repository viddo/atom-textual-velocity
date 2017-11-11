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
    return {
      columnHeaders: state.columnHeaders,
      editCellName: state.editCellName,
      itemsCount: state.sifterResult.total,
      listHeight: state.listHeight,
      loading: makeLoadingProps(state),
      paginationStart: paginationSelector(state).start,
      queryOriginal: state.queryOriginal,
      rowHeight: state.rowHeight,
      scrollTop: state.scrollTop,
      sortDirection: state.sifterResult.options.sort[0].direction,
      sortField: state.sifterResult.options.sort[0].field,
      visibleRows: visibleRowsSelector(state)
    };
  }

  function mapDispatchToProps(dispatch: Dispatch): MainPropsActions {
    return { actions: bindActionCreators(actionCreators, dispatch) };
  }

  return connect(mapStateToProps, mapDispatchToProps)(Main);
}

function makeLoadingProps(state: State) {
  switch (state.loading.status) {
    case "initialScan":
      return {
        status: "initialScan",
        filesCount: state.loading.rawFiles.length
      };

    case "readingFiles":
    default:
      return state.loading;
  }
}
