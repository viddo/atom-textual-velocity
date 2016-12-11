/* @flow */

import React from 'react'
import classNames from 'classnames'
import Cell from './cell'
import ScrollableList from './scrollable-list'
import TableColumn from './table-column'

export default React.createClass({

  propTypes: {
    actions: React.PropTypes.object.isRequired,
  render () {
    if (this.props.initialScanDone) {
      const itemsCount = 100
      return (
        <div className='textual-velocity'>
          <div className='tv-items'>
            <div className='header'>
              <table>
                <thead>
                  <tr>
                    {this.props.columns.map(c => {
                      return (
                          onSortByField={str => {}}
                          onChangeSortDirection={(val: SortDirectionType) => {}} />)
                    })}
                  </tr>
                </thead>
              </table>
            </div>
            <ScrollableList listHeight={listHeight} rowHeight={rowHeight} itemsCount={itemsCount}
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
          </div>
        </div>)
    }
  }
})
