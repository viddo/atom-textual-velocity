'use babel'

import moment from 'moment'
import React from 'react-for-atom'

// Item to render a summary
export default React.createClass({

  propTypes: {
    date: React.PropTypes.object
  },

  render () {
    return (
      <td>
        {moment(this.props.date).fromNow()}
      </td>
    )
  }

})
