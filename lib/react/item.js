'use babel'

import React from 'react-for-atom'
import classNames from 'classnames'

// Render an individual item row
// Note that the DOM element is-re-used for performance (by not using key property), which means that this component
// can't rely on componentDidMountm componentDidUnmount, or similar life-cycle methods.
export default React.createClass({

  propTypes: {
    children: React.PropTypes.array,
    item: React.PropTypes.object,
    isSelected: React.PropTypes.bool,
    index: React.PropTypes.number,
    selectIndexBus: React.PropTypes.object
  },

  shouldComponentUpdate (nextProps) {
    // This is necessary for the scrollIntoViewIfNeeded to only happen in case of Item is changed
    return nextProps.item !== this.props.item || nextProps.isSelected !== this.props.isSelected
  },

  render () {
    return (
      <tr className={classNames({'is-selected': this.props.isSelected})} onClick={this._onClickItem}>
        {this.props.children}
      </tr>
    )
  },

  componentDidUpdate () {
    if (this.props.isSelected) {
      React.findDOMNode(this).scrollIntoViewIfNeeded(false)
    }
  },

  _onClickItem (item) {
    this.props.selectIndexBus.push(this.props.index)
  }

})
