/* @flow */

import * as actionCreators from '../action-creators'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import Main from './main'
import paginationSelector from '../reselectors/pagination'
import makeVisibleRowsSelector from '../reselectors/visible-rows'

export default function makeApp (columns: Columns) {
  const visibleRowsSelector = makeVisibleRowsSelector(columns, paginationSelector)

  function mapStateToProps (state: State) {
    return {
      columnHeaders: state.columnHeaders,
      initialScanDone: !!state.initialScan.done,
      initialScanFilesCount: state.initialScan.rawFiles.length,
      itemsCount: state.sifterResult.total,
      listHeight: state.listHeight,
      paginationStart: paginationSelector(state).start,
      query: state.sifterResult.query,
      rowHeight: state.rowHeight,
      scrollTop: state.scrollTop,
      sortDirection: state.sifterResult.options.sort[0].direction,
      sortField: state.sifterResult.options.sort[0].field,
      visibleRows: visibleRowsSelector(state)
    }
  }

  function mapDispatchToProps (dispatch: Dispatch) {
    return {actions: bindActionCreators(actionCreators, dispatch)}
  }

  return connect(mapStateToProps, mapDispatchToProps)(Main)
}
