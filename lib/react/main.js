/* @flow */

import React from 'react'

export default React.createClass({
  render () {
    return (
      <div className='textual-velocity'>
        <div>
          Scanning dir for files… {this.props.scannedFilesCount} found
        </div>
      </div>)
  }
})
