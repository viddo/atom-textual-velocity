'use babel'

import {React, ReactDOM} from 'react-for-atom'
import Loading from './react/loading'
import Search from './react/search'
import TableColumnsHeader from './react/table-columns-header'
import Table from './react/table'
import ScrollableList from './react/scrollable-list'
import newPagination from './new-pagination'

export function renderLoading ({DOMNode, listHeight}) {
  ReactDOM.render(
    <div className='textual-velocity' style={{height: listHeight, overflow: 'auto'}}>
      <Loading />
    </div>, DOMNode)
}

export function renderResults ({DOMNode, interactor, listHeight, rowHeight, res}) {
  ReactDOM.render(
    <div className='textual-velocity'>
      <Search focusSearchInput={res.focusSearchInput} onSearch={string => interactor.search(string)} />
      <div className='tv-items'>
        <div className='header'>
          <table>
            <TableColumnsHeader columns={res.columns} />
          </table>
        </div>
        <ScrollableList listHeight={listHeight} rowHeight={rowHeight} itemsCount={res.itemsCount}
          paginationStart={res.paginationStart} forcedScrollTop={res.forcedScrollTop}
          onScroll={scrollTop => {
            interactor.paginate(newPagination({scrollTop: scrollTop, listHeight: listHeight, rowHeight: rowHeight}))
          }}>
          <Table columns={res.columns} rows={res.rows} reverseStripes={res.paginationStart % 2 === 1} />
        </ScrollableList>
      </div>
    </div>, DOMNode)
}

export function remove (DOMNode) {
  ReactDOM.unmountComponentAtNode(DOMNode)
  DOMNode.innerHTML = ''
}
