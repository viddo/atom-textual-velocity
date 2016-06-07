'use babel'

import {React, ReactDOM} from 'react-for-atom'
import Loading from './react/loading'
import Search from './react/search'
import TableColumnsHeader from './react/table-columns-header'
import Table from './react/table'
import ScrollableList from './react/scrollable-list'
import ResizeHandle from './react/resize-handle'

export function renderLoading ({DOMNode, listHeight}) {
  ReactDOM.render(
    <div className='textual-velocity' style={{height: listHeight, overflow: 'auto'}}>
      <Loading />
    </div>, DOMNode)
}

export function renderResults ({DOMNode, listHeight, rowHeight, res, onSearch, onScroll, onResize}) {
  ReactDOM.render(
    <div className='textual-velocity'>
      <Search focusSearchInput={res.focusSearchInput} onSearch={onSearch} />
      <div className='tv-items'>
        <div className='header'>
          <table>
            <TableColumnsHeader columns={res.columns} />
          </table>
        </div>
        <ScrollableList listHeight={listHeight} rowHeight={rowHeight} itemsCount={res.itemsCount}
          paginationStart={res.paginationStart} forcedScrollTop={res.forcedScrollTop}
          onScroll={onScroll}>
          <Table columns={res.columns} rows={res.rows} reverseStripes={res.paginationStart % 2 === 1} />
        </ScrollableList>
        <ResizeHandle listHeight={listHeight} onResize={onResize} />
      </div>
    </div>, DOMNode)
}

export function remove (DOMNode) {
  ReactDOM.unmountComponentAtNode(DOMNode)
  DOMNode.innerHTML = ''
}