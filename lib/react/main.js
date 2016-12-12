/* @flow */

import React from 'react'
import classNames from 'classnames'
import Cell from './cell'
import ScrollableList from './scrollable-list'
import Search from './search'
import TableColumn from './table-column'

export default React.createClass({

  propTypes: {
    actions: React.PropTypes.object.isRequired,
    columns: React.PropTypes.array.isRequired,
    forcedScrollTop: React.PropTypes.number,
    initialScanDone: React.PropTypes.bool.isRequired,
    initialScanFilesCount: React.PropTypes.number.isRequired,
    itemsCount: React.PropTypes.number.isRequired,
    listHeight: React.PropTypes.number.isRequired,
    paginationStart: React.PropTypes.number.isRequired,
    query: React.PropTypes.string.isRequired,
    rowHeight: React.PropTypes.number.isRequired,
    sortDirection: React.PropTypes.string.isRequired,
    sortField: React.PropTypes.string.isRequired,
    visibleRows: React.PropTypes.array.isRequired
  },

  render () {
    if (this.props.initialScanDone) {
      const {paginationStart, sortDirection, sortField} = this.props

      return (
        <div className='textual-velocity'>
          <Search str={this.props.query}
            onSearch={this.props.actions.search}
            onKeyDown={() => {}} />
          <div className='tv-items'>
            <div className='header'>
              <table>
                <thead>
                  <tr>
                    {this.props.columns.map(c => {
                      return (
                        <TableColumn key={c.title} column={c} sortDirection={sortDirection}
                          isSelected={c.sortField === sortField}
                          onSortByField={str => {}}
                          onChangeSortDirection={(val: SortDirectionType) => {}} />)
                    })}
                  </tr>
                </thead>
              </table>
            </div>
            <ScrollableList listHeight={this.props.listHeight} rowHeight={this.props.rowHeight}
              itemsCount={this.props.itemsCount} paginationStart={paginationStart}
              forcedScrollTop={this.props.forcedScrollTop} onScroll={this.props.actions.scrolled}>
              <table>
                <thead className='only-for-column-widths'>
                  <tr>
                    {this.props.columns.map(c => (
                      <th key={c.title} style={{width: `${c.width}%`}} />))}
                  </tr>
                </thead>
                <tbody className={classNames({'is-reversed-stripes': paginationStart % 2 === 1})}>
                  {this.props.visibleRows.map(row => {
                    return <tr key={row.id}
                      className={classNames({'is-selected': row.selected})}>
                      {row.cells.map((cell, i) => {
                        return (
                          <Cell key={i} content={cell.content} onClick={() => {}} />)
                      })}
                    </tr>
                  })}
                </tbody>
              </table>
            </ScrollableList>
          </div>
        </div>)
    } else {
      return (
        <div className='textual-velocity'>
          <div>
            {this.props.initialScanDone
              ? 'Scan done!'
              : `Scanning dir for files… ${this.props.initialScanFilesCount} files found`}
          </div>
        </div>)
    }
  }
})
