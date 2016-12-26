/* @flow */

import {React, ReactDOM} from 'react-for-atom'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import Cell from './cell'
import ResizeHandle from './resize-handle'
import ScrollableList from './scrollable-list'
import Search from './search'
import TableColumn from './table-column'

export default class Main extends React.Component {

  props: MainProps

  _debouncedChangeRowHeight: null

  render () {
    if (this.props.initialScanDone) {
      const {paginationStart, sortDirection, sortField} = this.props

      return (
        <div className='textual-velocity'>
          <Search query={this.props.query}
            onSearch={this.props.actions.search}
            onKeyPress={this.props.actions.keyPress} />
          <div className='tv-items'>
            <div className='header'>
              <table>
                <thead>
                  <tr>
                    {this.props.columnHeaders.map(c => {
                      return (
                        <TableColumn key={c.title} column={c} sortDirection={sortDirection}
                          isSelected={c.sortField === sortField}
                          onSortByField={this.props.actions.changeSortField}
                          onChangeSortDirection={this.props.actions.changeSortDirection} />)
                    })}
                  </tr>
                </thead>
              </table>
            </div>
            <ScrollableList listHeight={this.props.listHeight} rowHeight={this.props.rowHeight}
              itemsCount={this.props.itemsCount} paginationStart={paginationStart}
              scrollTop={this.props.scrollTop} onScroll={this.props.actions.scroll}>
              <table>
                <thead className='only-for-column-widths'>
                  <tr>
                    {this.props.columnHeaders.map(c => (
                      <th key={c.title} style={{width: `${c.width}%`}} />))}
                  </tr>
                </thead>
                <tbody className={classNames({'is-reversed-stripes': paginationStart % 2 === 1})}>
                  {this.props.visibleRows.map(row => {
                    return <tr key={row.id}
                      className={classNames({'is-selected': row.selected})}>
                      {row.cells.map((cell, i) => {
                        return (
                          <Cell key={i} cell={cell} onClick={() => {}} />)
                      })}
                    </tr>
                  })}
                </tbody>
              </table>
            </ScrollableList>
            <ResizeHandle listHeight={this.props.listHeight} onResize={this.props.actions.resizeList} />
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
