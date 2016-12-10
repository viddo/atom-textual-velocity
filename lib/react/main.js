/* @flow */

import React from 'react'
import classNames from 'classnames'
import Cell from './cell'
import ScrollableList from './scrollable-list'
import TableColumn from './table-column'

export default React.createClass({
  render () {
    if (this.props.initialScanDone) {
      const sort = {
        field: 'mtime',
        direction: 'desc'
      }
      const paginationStart = 0
      const listHeight = atom.config.get('textual-velocity.listHeight')
      const rowHeight = 25
      const itemsCount = 100
      const forcedScrollTop = 0
      return (
        <div className='textual-velocity'>
          <div className='tv-items'>
            <div className='header'>
              <table>
                <thead>
                  <tr>
                    {this.props.columns.map(c => {
                      return (
                        <TableColumn key={c.title} column={c} sortDirection={sort.direction}
                          isSelected={c.sortField === sort.field}
                          onSortByField={str => {}}
                          onChangeSortDirection={(val: SortDirectionType) => {}} />)
                    })}
                  </tr>
                </thead>
              </table>
            </div>
            <ScrollableList listHeight={listHeight} rowHeight={rowHeight} itemsCount={itemsCount}
              paginationStart={paginationStart} forcedScrollTop={forcedScrollTop}
              onScroll={val => {}}>
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
              : `Scanning dir for files… ${this.props.scannedFilesCount} files found`}
          </div>
        </div>)
    }
  }
})
