'use babel'

import {React} from 'react-for-atom'
import classNames from 'classnames'

export default React.createClass({

  propTypes: {
    children: React.PropTypes.array,
    file: React.PropTypes.object,
    isSelected: React.PropTypes.bool,
    index: React.PropTypes.number,
    selectIndexBus: React.PropTypes.object
  },

  render () {
    return (
      <tr className={classNames({'is-selected': this.props.isSelected})} onClick={this._onClick}>
        {this.props.children}
      </tr>
    )
  },

  _onClick (file) {
    this.props.selectIndexBus.push(this.props.index)
  }

})
