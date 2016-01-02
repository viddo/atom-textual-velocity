'use babel'

import React from 'react-for-atom'

// Item to render a summary
export default React.createClass({

  propTypes: {
    path: React.PropTypes.string,
    preview: React.PropTypes.string
  },

  render () {
    this.props.preview
    return (
      <td>
        {this.props.path}
        <span className='text-subtle'>{this.props.preview}</span>
      </td>
    )
  }

})
