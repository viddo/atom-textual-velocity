/* @flow */

import * as actionCreators from '../action-creators'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import Main from './main'
import makeVisibleRowsSelector from '../reselectors/visible-rows'

export default function makeApp (columns: Columns) {
  const visibleRowsSelector = makeVisibleRowsSelector(columns)

  function mapStateToProps (state: State) {
    return {
      columnHeaders: state.columnHeaders,
      initialScanDone: !!state.initialScan.done,
      initialScanFilesCount: state.initialScan.rawFiles.length,
      itemsCount: state.sifterResult.total,
      listHeight: state.config.listHeight,
      paginationStart: state.pagination.start,
      query: state.sifterResult.query,
      rowHeight: state.config.rowHeight,
      scrollTop: state.scrollTop,
      sortDirection: state.config.sortDirection,
      sortField: state.config.sortField,
      visibleRows: visibleRowsSelector(state)
    }
  }

  function mapDispatchToProps (dispatch: Dispatch) {
    return {actions: bindActionCreators(actionCreators, dispatch)}
  }

  return connect(mapStateToProps, mapDispatchToProps)(Main)
}
