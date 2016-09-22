'use babel'

import {React} from 'react-for-atom'

export default React.createClass({

  propTypes: {
    readCount: React.PropTypes.number,
    totalCount: React.PropTypes.number
  },

  render () {
    if (isNaN(this.props.readCount) || isNaN(this.props.totalCount)) {
      return <span />
    } else {
      return (
        <div className='tv-loading-progress'>
          <span className='inline-block text-smaller text-subtle'>
            Reading {this.props.readCount} of {this.props.totalCount} notes
          </span>
          <progress className='inline-block' max={this.props.totalCount} value={this.props.readCount} />
        </div>)
    }
  }

})
