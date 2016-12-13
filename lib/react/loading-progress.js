/* @flow */

import {React} from 'react-for-atom'

export default class LoadingProgress extends React.Component {

  props: {
    readyCount: number,
    totalCount: number
  }

  render () {
    if (isNaN(this.props.readyCount) || isNaN(this.props.totalCount)) {
      return <span />
    } else {
      return (
        <div className='tv-loading-progress'>
          <span className='inline-block text-smaller text-subtle'>
            Reading {this.props.readyCount} of {this.props.totalCount} notes
          </span>
          <span className='icon icon-info' ref='tooltip' onClick={this._onClick.bind(this)} />
          <progress className='inline-block' max={this.props.totalCount} value={this.props.readyCount} />
        </div>)
    }
  }

  _onClick () {
    atom.notifications.addInfo('Reading files', {
      description: 'This is necesary to populate the search index. It is only necessary the first time, the notes will be cached for next session.',
      dismissible: true
    })
  }

}
