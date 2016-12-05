/* @flow */

import React from 'react'
import R from 'ramda'

export default React.createClass({
  render () {
    return (
      <div className='textual-velocity'>
        <div style={{height: this.props.listHeight, overflow: 'auto'}}>
          {R.times(i => <span key={i} className='tv-dot' />, this.props.filesCount)}
        </div>
      </div>)
  }
})
