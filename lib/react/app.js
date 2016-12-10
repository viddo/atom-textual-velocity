/* @flow */
import {connect} from 'react-redux'
import Main from './main'

function mapStateToProps (state) {
  return {
    listHeight: state.config.listHeight,
    initialScanDone: !!state.initialScan.done,
    scannedFilesCount: state.initialScan.rawFiles.length,
    columns: state.columns,
    rows: state.rows
  }
}

const App = connect(mapStateToProps)(Main)

export default App
