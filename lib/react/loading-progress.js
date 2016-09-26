'use babel'

import {React} from 'react-for-atom'

export default React.createClass({

  propTypes: {
    readyCount: React.PropTypes.number,
    totalCount: React.PropTypes.number
  },

  render () {
    if (isNaN(this.props.readyCount) || isNaN(this.props.totalCount)) {
      return <span />
    } else {
      return (
        <div className='tv-loading-progress' ref='tooltip' onMouseOver={this._onHover}>
          <span className='inline-block text-smaller text-subtle'>
            Reading {this.props.readyCount} of {this.props.totalCount} notes
          </span>
          <span className='icon icon-info' />
          <progress className='inline-block' max={this.props.totalCount} value={this.props.readyCount} />
        </div>)
    }
  },

  _onHover () {
    atom.notifications.addInfo('Reading files', {
      description: 'This is necesary to populate the search index. It is only necessary the first time, the notes will be cached for next session.',
      dismissible: true
    })
  }
})
