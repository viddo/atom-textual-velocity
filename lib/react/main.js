/* @flow */

import {React, ReactDOM} from 'react-for-atom'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import Cell from './cell'
import LoadingProgress from './loading-progress'
import ResizeHandle from './resize-handle'
import ScrollableList from './scrollable-list'
import Search from './search'
import TableColumn from './table-column'

export default class Main extends React.Component {

  props: MainProps
  _debouncedChangeRowHeight: null

  render () {
    const {actions} = this.props

    if (!this.props.initialScanDone) {
      return (
        <div className='textual-velocity'>
          <div className='tv-loading-progress'>
            <span className='inline-block text-smaller text-subtle'>
              Scanning path… {this.props.initialScanFilesCount} files found
            </span>
            <progress className='inline-block' value={0} />
          </div>
        </div>
      )
    }

    const {paginationStart, sortDirection, sortField} = this.props

    return (
      <div className='textual-velocity'>
        <Search query={this.props.query}
          onSearch={actions.search}
          onKeyPress={actions.keyPress} />
        <LoadingProgress readyCount={this.props.readyCount} totalCount={this.props.totalCount} />
        <div className='tv-items'>
          <div className='header'>
            <table>
              <thead>
                <tr>
                  {this.props.columnHeaders.map(column => {
                    return (
                      <TableColumn key={column.title} column={column} sortDirection={sortDirection}
                        isSelected={column.sortField === sortField}
                        onSortByField={actions.changeSortField}
                        onChangeSortDirection={actions.changeSortDirection} />
                    )
                  })}
                </tr>
              </thead>
            </table>
          </div>
          <ScrollableList listHeight={this.props.listHeight} rowHeight={this.props.rowHeight}
            itemsCount={this.props.itemsCount} paginationStart={paginationStart}
            scrollTop={this.props.scrollTop} onScroll={actions.scroll}>
            <table>
              <thead className='only-for-column-widths'>
                <tr>
                  {this.props.columnHeaders.map(column => (
                    <th key={column.title} style={{width: `${column.width}%`}} />))}
                </tr>
              </thead>
              <tbody className={classNames({'is-reversed-stripes': paginationStart % 2 === 1})}>
                {this.props.visibleRows.map(row => {
                  const {filename} = row
                  return (
                    <tr key={row.id}
                      onClick={() => { actions.clickRow(filename) }}
                      className={classNames({'is-selected': row.selected})}>
                      {row.cells.map((cell, i) => {
                        return (
                          <Cell key={i} cell={cell} />
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ScrollableList>
          <ResizeHandle listHeight={this.props.listHeight} onResize={actions.resizeList} />
        </div>
      </div>
    )
  }

  componentDidMount () {
    this._debouncedChangeRowHeight = debounce(() => {
      const td = ReactDOM.findDOMNode(this).querySelector('td')
      if (td && td.clientHeight > 0) {
        this.props.actions.changeRowHeight(td.clientHeight)
      }
    }, 50)
    window.addEventListener('resize', this._debouncedChangeRowHeight)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this._debouncedChangeRowHeight)
    if (this._debouncedChangeRowHeight) {
      this._debouncedChangeRowHeight.cancel()
    }
  }

}
