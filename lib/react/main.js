/* @flow */

import React from 'react'

export default React.createClass({
  render () {
    const statusText = this.props.initialScanDone ? 'Scan done!' : 'Scanning dir for files…'
    return (
      <div className='textual-velocity'>
        <div>
          {statusText} {this.props.scannedFilesCount} files found
        </div>
      </div>)
  }
})
