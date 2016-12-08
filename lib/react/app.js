/* @flow */
import {connect} from 'react-redux'
import Main from './main'

function mapStateToProps (state) {
  return {
    listHeight: state.ui.listHeight,
    initialScanDone: !!state.initialScan.done,
    scannedFilesCount: state.initialScan.files.length
  }
}

const App = connect(mapStateToProps)(Main)

export default App
