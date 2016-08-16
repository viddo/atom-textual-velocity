/* @flow */

import {React, ReactDOM} from 'react-for-atom'
import classNames from 'classnames'
import Search from './react/search'
import TableColumnsHeader from './react/table-columns-header'
import ScrollableList from './react/scrollable-list'
import Cell from './react/cell'
import ResizeHandle from './react/resize-handle'

export default class ReactView {

  _atomPanel: AtomPanel

  constructor (atomPanel: AtomPanel) {
    this._atomPanel = atomPanel
  }

  renderLoading (listHeight: number) {
    ReactDOM.render(
      <div className="textual-velocity" style={{height: listHeight, overflow: 'auto'}}>
        <div className="tv-loader" style={{ display: 'block' }}>
          <ul className="background-message">
            <li>
              <div className="padded">
                <span className="loading loading-spinner-small inline-block" />
                <span className="inline-block padded">Loading notes</span>
              </div>
            </li>
          </ul>
        </div>
      </div>, this._DOMNode)
  }

  renderResults (params: ResultsViewParamsType) {
    const {listHeight, rowHeight, forcedScrollTop, res, callbacks} = params
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
      </div>, this._DOMNode)
  }

  dispose () {
    ReactDOM.unmountComponentAtNode(this._DOMNode)
  }

  get _DOMNode (): HTMLElement {
    return this._atomPanel.getItem()
  }

}
