/* @flow */

import {React, ReactDOM} from 'react-for-atom'
import Bacon from 'baconjs'
import classNames from 'classnames'
import Search from './react/search'
import TableColumnsHeader from './react/table-columns-header'
import ScrollableList from './react/scrollable-list'
import Cell from './react/cell'
import EditCellStr from './react/edit-cell-str'
import ResizeHandle from './react/resize-handle'
import R from 'ramda'

const DOUBLE_CLICK_THROTTLE_TIME = 300 // ms

export default class ReactView {

  _panel: Atom$Panel

  _abortEditCellBus: Bacon.Bus
  _clickCellBus: Bacon.Bus
  _dblClickCellBus: Bacon.Bus
  _keyDownBus: Bacon.Bus
  _listHeightBus: Bacon.Bus
  _saveEditedCellContentBus: Bacon.Bus
  _scrollTopBus: Bacon.Bus
  _selectedIndexBus: Bacon.Bus
  _sortDirectionBus: Bacon.Bus
  _sortFieldBus: Bacon.Bus
  _textInputBus: Bacon.Bus

  abortEditCellStream: Bacon.Stream
  clickedCellStream: Bacon.Stream
  dblClickedCellStream: Bacon.Stream
  keyDownStream: Bacon.Stream
  listHeightStream: Bacon.Stream
  saveEditedCellContentStream: Bacon.Stream
  scrollTopStream: Bacon.Stream
  sortFieldStream: Bacon.Stream
  sortDirectionStream: Bacon.Stream
  textInputStream: Bacon.Stream

  constructor (panel: Atom$Panel) {
    this._panel = panel

    this._abortEditCellBus = new Bacon.Bus()
    this._clickCellBus = new Bacon.Bus()
    this._keyDownBus = new Bacon.Bus()
    this._listHeightBus = new Bacon.Bus()
    this._saveEditedCellContentBus = new Bacon.Bus()
    this._selectedIndexBus = new Bacon.Bus()
    this._scrollTopBus = new Bacon.Bus()
    this._sortDirectionBus = new Bacon.Bus()
    this._sortFieldBus = new Bacon.Bus()
    this._textInputBus = new Bacon.Bus()

    this.abortEditCellStream = this._abortEditCellBus
    this.clickedCellStream = this._clickCellBus // only let through a single click on double click
      .map(clickVal => ({
        time: +new Date(),
        clickVal: clickVal}))
      .toProperty({time: 0})
      .slidingWindow(2, 2)
      .filter(([a, b]) => {
        return b.time - a.time > DOUBLE_CLICK_THROTTLE_TIME // ms
      })
      .map(([, {clickVal: {index}}]) => index)
      .changes()
    this.dblClickedCellStream = this._clickCellBus
      .bufferWithTimeOrCount(DOUBLE_CLICK_THROTTLE_TIME, 2)
      .filter(R.propEq('length', 2))
      .map(([, {cell}]) => cell)

    this.keyDownStream = this._keyDownBus
    this.listHeightStream = this._listHeightBus
    this.saveEditedCellContentStream = this._saveEditedCellContentBus
    this.scrollTopStream = this._scrollTopBus
    this.sortDirectionStream = this._sortDirectionBus
    this.sortFieldStream = this._sortFieldBus
    this.textInputStream = this._textInputBus
  }

  renderLoading (listHeight: number) {
    ReactDOM.render(
      <div className='textual-velocity' style={{height: listHeight, overflow: 'auto'}}>
        <div className='tv-loader' style={{ display: 'block' }}>
          <ul className='background-message'>
            <li>
              <div className='padded'>
                <span className='loading loading-spinner-small inline-block' />
                <span className='inline-block padded'>Scanning dir for files</span>
              </div>
            </li>
          </ul>
        </div>
      </div>, this._DOMNode)
  }

  renderResults (params: ResultsViewParamsType) {
    const {columns, forcedScrollTop, itemsCount, listHeight, paginationStart, rowHeight, rows, searchStr, sort} = params

    ReactDOM.render(
      <div className='textual-velocity'>
        <Search str={searchStr}
          onSearch={str => this._textInputBus.push(str)}
          onKeyDown={ev => this._keyDownBus.push(ev)} />
        <div className='tv-items'>
          <div className='header'>
            <table>
              <TableColumnsHeader columns={columns} sort={sort}
                onSortByField={str => this._sortFieldBus.push(str)}
                onChangeSortDirection={(val: SortDirectionType) => this._sortDirectionBus.push(val)} />
            </table>
          </div>
          <ScrollableList listHeight={listHeight} rowHeight={rowHeight} itemsCount={itemsCount}
            paginationStart={paginationStart} forcedScrollTop={forcedScrollTop}
            onScroll={val => this._scrollTopBus.push(val)}>
            <table>
              <thead className='only-for-column-widths'>
                <tr>
                  {columns.map(c => (
                    <th key={c.title} style={{width: `${c.width}%`}} />))}
                </tr>
              </thead>
              <tbody className={classNames({'is-reversed-stripes': paginationStart % 2 === 1})}>
                {rows.map(row => {
                  const index = row.index
                  return <tr key={row.id}
                    className={classNames({'is-selected': row.selected})}>
                    {row.cells.map((cell, i) => {
                      const clickVal = {index: index, cell: cell}
                      if (typeof cell.editCellStr === 'string') {
                        return (
                          <EditCellStr key={i} initialVal={cell.editCellStr}
                            save={str => this._saveEditedCellContentBus.push(str)}
                            abort={() => this._abortEditCellBus.push()} />)
                      } else {
                        return (
                          <Cell key={i} content={cell.content} onClick={() => this._clickCellBus.push(clickVal)} />)
                      }
                    })}
                  </tr>
                })}
              </tbody>
            </table>
          </ScrollableList>
          <ResizeHandle listHeight={listHeight} onResize={val => this._listHeightBus.push(val)} />
        </div>
      </div>, this._DOMNode)
  }

  dispose () {
    ReactDOM.unmountComponentAtNode(this._DOMNode)
    this._clickCellBus.end()
    this._clickCellBus = null
    this._keyDownBus.end()
    this._keyDownBus = null
    this._listHeightBus.end()
    this._listHeightBus = null
    this._saveEditedCellContentBus.end()
    this._saveEditedCellContentBus = null
    this._scrollTopBus.end()
    this._scrollTopBus = null
    this._selectedIndexBus.end()
    this._selectedIndexBus = null
    this._sortDirectionBus.end()
    this._sortDirectionBus = null
    this._sortFieldBus.end()
    this._sortFieldBus = null
    this._textInputBus.end()
    this._textInputBus = null
  }

  get _DOMNode (): DOMNodeType {
    return this._panel.getItem()
  }

}
