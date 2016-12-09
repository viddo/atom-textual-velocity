/* @flow */

import React from 'react'

export default React.createClass({
  render () {
    return (
      <div className='textual-velocity'>
        <div>
          {this.props.initialScanDone
            ? 'Scan done!'
            : `Scanning dir for files… ${this.props.scannedFilesCount} files found`}
        </div>
      </div>)
  }
})
