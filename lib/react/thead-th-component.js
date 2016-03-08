'use babel'

import {React} from 'react-for-atom'
import classNames from 'classnames'

export default React.createClass({

  propTypes: {
    column: React.PropTypes.object,
    sortFieldBus: React.PropTypes.object,
    sortDirectionBus: React.PropTypes.object,
    sortDirection: React.PropTypes.string,
    isSelected: React.PropTypes.bool
  },

  render () {
    const c = this.props.column
    return (
      <th style={{width: c.width + '%'}} onClick={this._onClick}
          className={classNames({'is-selected': this.props.isSelected})}>
        {c.title}&nbsp;{this._sortIndicator()}
      </th>
    )
  },

  _sortIndicator () {
    if (this.props.isSelected) {
      return (
        <span className={classNames({
          'icon': true,
          'icon-triangle-up': this.props.sortDirection === 'asc',
          'icon-triangle-down': this.props.sortDirection === 'desc'
        })} />
      )
    }
  },

  _onClick () {
    if (this.props.isSelected) {
      this.props.sortDirectionBus.push(
        this.props.sortDirection === 'asc'
          ? 'desc'
          : 'asc')
    } else {
      this.props.sortFieldBus.push(this.props.column.sortField)
    }
  }
})
