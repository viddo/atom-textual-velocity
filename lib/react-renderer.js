/* @flow */

import {React, ReactDOM} from 'react-for-atom' // eslint-disable-line
import classNames from 'classnames'
import Loading from './react/loading'
import Search from './react/search'
import TableColumnsHeader from './react/table-columns-header'
import ScrollableList from './react/scrollable-list'
import Cell from './react/cell'
import ResizeHandle from './react/resize-handle'

export function renderLoading (params: LoadingParamsType) {
  const {DOMNode, listHeight} = params
  ReactDOM.render(
    <div className="textual-velocity" style={{height: listHeight, overflow: 'auto'}}>
      <Loading />
    </div>, DOMNode)
}

export function renderResults (params: ResultsViewParamsType) {
  const {DOMNode, listHeight, rowHeight, forcedScrollTop, res, callbacks} = params
  ReactDOM.render(
    <div className="textual-velocity">
      <Search str={res.searchStr} onSearch={callbacks.onSearch} onKeyDown={callbacks.onKeyDown} />
      <div className="tv-items">
        <div className="header">
          <table>
            <TableColumnsHeader columns={res.columns} sort={res.sort}
              onSortByField={callbacks.onSortByField}
              onChangeSortDirection={callbacks.onChangeSortDirection} />
          </table>
        </div>
        <ScrollableList listHeight={listHeight} rowHeight={rowHeight} itemsCount={res.itemsCount}
          paginationStart={res.paginationStart} forcedScrollTop={forcedScrollTop} onScroll={callbacks.onScroll}>
          <table>
            <thead className="only-for-column-widths">
              <tr>
                {res.columns.map(c => (
                  <th key={c.id} style={{width: `${c.width}%`}} />))}
              </tr>
            </thead>
            <tbody className={classNames({'is-reversed-stripes': res.paginationStart % 2 === 1})}>
              {res.rows.map(row => (
                <tr key={row.id}
                  className={classNames({'is-selected': row.selected})}
                  onClick={() => callbacks.onClickRow(row.index)}>
                  {row.cells.map((content, i) => (
                    <Cell key={i} content={content} />))}
                </tr>))}
            </tbody>
          </table>
        </ScrollableList>
        <ResizeHandle listHeight={listHeight} onResize={callbacks.onResize} />
      </div>
    </div>, DOMNode)
}

export function remove (DOMNode: HTMLElement) {
  ReactDOM.unmountComponentAtNode(DOMNode)
  DOMNode.innerHTML = ''
}
