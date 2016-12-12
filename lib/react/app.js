/* @flow */

import * as actionCreators from '../action-creators'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import Main from './main'

function mapStateToProps (state: State) {
  return {
    columns: state.columns,
    forcedScrollTop: state.forcedScrollTop,
    initialScanDone: !!state.initialScan.done,
    initialScanFilesCount: state.initialScan.rawFiles.length,
    itemsCount: state.sifterResult.total,
    listHeight: state.config.listHeight,
    paginationStart: state.pagination.start,
    query: state.sifterResult.query,
    rowHeight: state.config.rowHeight,
    sortDirection: state.config.sortDirection,
    sortField: state.config.sortField,
    visibleRows: state.visibleRows
  }
}

function mapDispatchToProps (dispatch: Dispatch) {
  return {actions: bindActionCreators(actionCreators, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
