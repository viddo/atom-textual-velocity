'use babel'

import React from 'react-for-atom'

// Item to render a summary
export default React.createClass({

  propTypes: {
    title: React.PropTypes.string
  },

  render () {
    return (
      <td>
        {this.props.title}
      </td>
    )
  }

})