/* @flow */

import * as atoms from './atom-streams'
import Bacon from 'baconjs'
import classNames from 'classnames'
import fs from 'fs-plus'
import Path from 'path'
import R from 'ramda'
import {React, ReactDOM} from 'react-for-atom'
import LoadingProgress from './react/loading-progress'
import Search from './react/search'
import TableColumnsHeader from './react/table-columns-header'
import ScrollableList from './react/scrollable-list'
import Cell from './react/cell'
import EditCellStr from './react/edit-cell-str'
import ResizeHandle from './react/resize-handle'

const DOUBLE_CLICK_THROTTLE_TIME = 300 // ms

export default class ViewCtrl {

  abortEditCellS: Bacon.Stream
  activePathS: Bacon.Stream
  clickedCellS: Bacon.Stream
  dblClickedCellS: Bacon.Stream
  keyDownS: Bacon.Stream
  keyEnterS: Bacon.Stream
  keyEscS: Bacon.Stream
  keyUpS: Bacon.Stream
  listHeightS: Bacon.Stream
  rowHeightS: Bacon.Stream
  saveEditedCellContentS: Bacon.Stream
  scrollTopS: Bacon.Stream
  sessionStartS: Bacon.Stream
  sortDirectionS: Bacon.Stream
  sortFieldS: Bacon.Stream
  textInputS: Bacon.Stream

  _panel: Atom$Panel
  _abortEditCellBus: Bacon.Bus
  _clickCellBus: Bacon.Bus
  _keyDownBus: Bacon.Bus
  _listHeightBus: Bacon.Bus
  _saveEditedCellContentBus: Bacon.Bus
  _scrollTopBus: Bacon.Bus
  _selectedIndexBus: Bacon.Bus
  _sortDirectionBus: Bacon.Bus
  _sortFieldBus: Bacon.Bus
  _startSessionBus: Bacon.Bus
  _textInputBus: Bacon.Bus

  constructor (panel: Atom$Panel) {
    this._panel = panel

    this._abortEditCellBus = new Bacon.Bus()
    this._clickCellBus = new Bacon.Bus()
    this._keyDownBus = new Bacon.Bus()
    this._listHeightBus = new Bacon.Bus()
    this._saveEditedCellContentBus = new Bacon.Bus()
    this._scrollTopBus = new Bacon.Bus()
    this._selectedIndexBus = new Bacon.Bus()
    this._sortDirectionBus = new Bacon.Bus()
    this._sortFieldBus = new Bacon.Bus()
    this._startSessionBus = new Bacon.Bus()
    this._textInputBus = new Bacon.Bus()

    this.abortEditCellS = this._abortEditCellBus
    this.rowHeightS = atoms.createConfigStream('textual-velocity.rowHeight').skipDuplicates()
    this.saveEditedCellContentS = this._saveEditedCellContentBus
    this.scrollTopS = this._scrollTopBus
    this.sessionStartS = this._startSessionBus
    this.textInputS = this._textInputBus

    this.activePathS = atoms
      .createStream(atom.workspace, 'onDidStopChangingActivePaneItem')
      .map(paneItem => {
        if (paneItem && paneItem.getPath) {
          return paneItem.getPath()
        }
      })
      .skip(1)

    this.dblClickedCellS = this._clickCellBus
      .bufferWithTimeOrCount(DOUBLE_CLICK_THROTTLE_TIME, 2)
      .flatMap(([a, b]) => {
        return b && b.cell || Bacon.never()
      })

    this.clickedCellS = this._clickCellBus // single click
      .map(({filename}) => ({
        time: Date.now(),
        filename: filename}))
      .diff({time: 0}, (a, b) => [a, b])
      .flatMap(([a, b]) => {
        return b.time - a.time > DOUBLE_CLICK_THROTTLE_TIME
          ? b.filename
          : Bacon.never()
      })

    const newKeyS = keyCode => this._keyDownBus
      .filter(R.propEq('keyCode', keyCode))
      .doAction('.preventDefault')
    this.keyDownS = newKeyS(40)
    this.keyEnterS = newKeyS(13)
    this.keyEscS = newKeyS(27)
    this.keyUpS = newKeyS(38)

    this.listHeightS = Bacon
      .mergeAll(
        this._listHeightBus,
        atoms.createConfigStream('textual-velocity.listHeight'))
      .skipDuplicates()

    this.sortDirectionS = Bacon
      .mergeAll(
        this._sortDirectionBus,
        atoms.createConfigStream('textual-velocity.sortDirection'))
      .skipDuplicates()

    this.sortFieldS = Bacon
      .mergeAll(
        this._sortFieldBus,
        atoms.createConfigStream('textual-velocity.sortField'))
      .skipDuplicates()
  }

  activate (notes: Object) {
    const req: SessionType = {
      excludeVcsIgnoredPaths: atom.config.get('textual-velocity.excludeVcsIgnoredPaths'),
      ignoredNames: R.union(atom.config.get('core.ignoredNames'), atom.config.get('textual-velocity.ignoredNames')),
      listHeight: atom.config.get('textual-velocity.listHeight'),
      notes: notes,
      rootPath: this._normalizedPath(atom.config.get('textual-velocity.path')),
      rowHeight: atom.config.get('textual-velocity.rowHeight')
    }
    this._startSessionBus.push(req)
  }

  renderLoading (listHeight: number) {
    ReactDOM.render(
      <div className='textual-velocity' style={{height: listHeight, overflow: 'auto'}}>
        <div className='tv-loader' style={{ display: 'block' }}>
          <ul className='background-message'>
            <li>
              <div className='padded'>
                <span className='loading loading-spinner-small inline-block' />
                <span className='inline-block padded'>
                  Scanning dir for files
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>, this._DOMNode)
  }

  renderResults (params: ResultsViewParamsType) {
    const {columns, forcedScrollTop, itemsCount, listHeight, loadingProgress, paginationStart, rowHeight, rows, searchStr, sort} = params
    const {ready: readyCount, total: totalCount} = loadingProgress || {}

    ReactDOM.render(
      <div className='textual-velocity'>
        <Search str={searchStr}
          onSearch={str => this._textInputBus.push(str)}
          onKeyDown={ev => this._keyDownBus.push(ev)} />
        <LoadingProgress readyCount={readyCount} totalCount={totalCount} />
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
                  const filename = row.filename
                  return <tr key={row.id}
                    className={classNames({'is-selected': row.selected})}>
                    {row.cells.map((cell, i) => {
                      if (typeof cell.editCellStr === 'string') {
                        return (
                          <EditCellStr key={i} initialVal={cell.editCellStr}
                            save={str => this._saveEditedCellContentBus.push(str)}
                            abort={() => this._abortEditCellBus.push()} />)
                      } else {
                        return (
                          <Cell key={i} content={cell.content} onClick={() => {
                            this._clickCellBus.push({filename: filename, cell: cell})
                          }} />)
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
    this._abortEditCellBus.end()
    this._abortEditCellBus = null
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
    this._startSessionBus.end()
    this._startSessionBus = null
    this._textInputBus.end()
    this._textInputBus = null
    ReactDOM.unmountComponentAtNode(this._DOMNode)
  }

  get _DOMNode (): DOMNodeType {
    return this._panel.getItem()
  }

  _normalizedPath (path: string): string {
    path = fs.normalize(path.trim() || 'notes')
    return Path.isAbsolute(path)
      ? path
      : Path.join(atom.configDirPath, path)
  }

}
