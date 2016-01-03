'use babel'

import Path from 'path'
import React from 'react-for-atom'

// Item to render a summary
export default React.createClass({

  propTypes: {
    path: React.PropTypes.string
  },

  render () {
    const basename = Path.basename(this.props.path)
    return (
      <td>
        <span className='text-subtle'>{this.props.path.replace(basename, '')}</span>
        {basename}
      </td>
    )
  }

})
