'use babel'

import {React} from 'react-for-atom'
import classNames from 'classnames'

export default React.createClass({

  propTypes: {
    column: React.PropTypes.object,
    isSelected: React.PropTypes.bool,
    sortDirection: React.PropTypes.string,
    onSortByField: React.PropTypes.func,
    onChangeSortDirection: React.PropTypes.func
  },

  render () {
    const c = this.props.column
    return (
      <th style={{width: `${c.width}%`}} className={classNames({'is-selected': this.props.isSelected})}
        onClick={this._onClick}>
        {c.title}&nbsp;{this._sortIndicator()}
      </th>)
  },

  _sortIndicator () {
    if (this.props.isSelected) {
      return (
        <span className={classNames({
          'icon': true,
          'icon-triangle-up': this.props.sortDirection === 'asc',
          'icon-triangle-down': this.props.sortDirection === 'desc'
        })} />)
    }
  },

  _onClick () {
    if (this.props.isSelected) {
      this.props.onChangeSortDirection()
    } else {
      this.props.onSortByField(this.props.column.sortField)
    }
  }

})
