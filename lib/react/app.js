/* @flow */
import {connect} from 'react-redux'
import Main from './main'

function mapStateToProps (state) {
  return {
    listHeight: state.ui.listHeight,
    scannedFilesCount: state.scannedFiles.length
  }
}

const App = connect(mapStateToProps)(Main)

export default App
