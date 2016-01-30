'use babel'

import React from 'react-for-atom'

export default React.createClass({

  propTypes: {
    width: React.PropTypes.string,
    title: React.PropTypes.string
  },

  render () {
    return (
      <th style={{width: this.props.width}}>
        {this.props.title}
      </th>
    )
  }

})
