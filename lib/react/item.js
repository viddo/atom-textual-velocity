'use babel'

import React from 'react-for-atom'
import classNames from 'classnames'

export default React.createClass({

  propTypes: {
    children: React.PropTypes.array,
    item: React.PropTypes.object,
    isSelected: React.PropTypes.bool,
    index: React.PropTypes.number,
    selectIndexBus: React.PropTypes.object
  },

  render () {
    return (
      <tr className={classNames({'is-selected': this.props.isSelected})} onClick={this._onClickItem}>
        {this.props.children}
      </tr>
    )
  },

  _onClickItem (item) {
    this.props.selectIndexBus.push(this.props.index)
  }

})
