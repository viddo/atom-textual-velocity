'use babel'

import React from 'react-for-atom'
import Bacon from 'baconjs'
import R from 'ramda'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import * as getIndex from '../get-index'
import getAdjustedScrollTop from '../get-adjusted-scroll-top'
import Search from './search'
import ScrollableContent from './scrollable-content'
import ResizeHandle from './resize-handle'
import Th from './th'
import Item from './item'
import Summary from './cells/summary'
import DateTime from './cells/date-time'
import BaconMixin from './baconjs-mixin'

export default React.createClass({

  mixins: [BaconMixin],

  propTypes: {
    openProjectPathStream: React.PropTypes.object,
    parsedprojectPathStream: React.PropTypes.object,
    bodyHeightStream: React.PropTypes.object,
    focusStream: React.PropTypes.object,
    resultsProp: React.PropTypes.object
  },

  getInitialState () {
    return {
      rowHeight: 25,
      bodyHeight: 100,
      scrollTop: 0,
      // TODO mapped version of titles, calculated widths, createCell
      columns: [
        {
          title: 'Name',
          width: 70,
          createCell: (item, r) => <Summary key='name' item={item} results={r} />
        }, {
          title: 'Date modified',
          width: 15,
          createCell: item => <DateTime key='mtime' time={item.stat.mtime} />
        }, {
          title: 'Date created',
          width: 15,
          createCell: item => <DateTime key='birhtime' time={item.stat.birthtime} />
        }
      ],
      results: {
        searchStr: '',
        paginationOffset: 0,
        regexp: undefined,
        total: 0,
        items: []
      },
      selectedIndex: undefined,
      parsingPathsCount: null
    }
  },

  componentWillMount () {
    let selectIndexBus = new Bacon.Bus()
    let changeBus = new Bacon.Bus()
    let keyDownBus = new Bacon.Bus()
    let bodyHeightBus = new Bacon.Bus()

    let resetStream = keyDownBus.filter(R.propEq('keyCode', 27)).map('') // <esc>
    let searchStream = changeBus.map('.target.value').merge(resetStream)
    let searchProp = searchStream.toProperty('')

    bodyHeightBus.plug(this.props.bodyHeightStream)
    let bodyHeightProp = bodyHeightBus.skipDuplicates().filter(newHeight => newHeight > 0).toProperty(100)

    let selectPrevStream = keyDownBus.filter(R.propEq('keyCode', 38)).doAction('.preventDefault') // <up>
    let selectNextStream = keyDownBus.filter(R.propEq('keyCode', 40)).doAction('.preventDefault') // <down>

    let selectedIndexProp = Bacon.update(
      undefined,
      [searchStream], R.always(undefined),
      [selectIndexBus], R.nthArg(-1),
      [selectPrevStream, this.props.resultsProp], (selectedIndex, _, r) => getIndex.prev(r.total, selectedIndex),
      [selectNextStream, this.props.resultsProp], (selectedIndex, _, r) => getIndex.next(r.total, selectedIndex)
    ).skipDuplicates()

    let scrollTopBus = new Bacon.Bus()
    let scrollTopProp = Bacon.update(
      0,
      [scrollTopBus.skipDuplicates()], R.nthArg(-1),
      [searchStream], R.always(0),
      [selectedIndexProp.filter(R.is(Number)).changes()], (scrollTop, selectedIndex) => {
        return getAdjustedScrollTop({
          rowHeight: this.state.rowHeight,
          bodyHeight: this.state.bodyHeight,
          scrollTop: scrollTop,
          selectedIndex: selectedIndex
        })
      }
    )

    this.addBaconSideEffects(Bacon
      .combineTemplate({
        bodyHeight: bodyHeightProp,
        scrollTop: scrollTopProp,
        results: this.props.resultsProp,
        selectedIndex: selectedIndexProp
      })
      .onValue(state => this.setState(state))
    )

    this.addBaconSideEffects(
      this.props.openProjectPathStream.onValue(path => {
        this.setState(function (previousState, currentProps) {
          return {parsingPathsCount: previousState.parsingPathsCount + 1}
        })
      }),
      this.props.parsedprojectPathStream.onValue(path => {
        this.setState(function (previousState, currentProps) {
          return {parsingPathsCount: previousState.parsingPathsCount - 1}
        })
      })
    )

    // expose some observables for sub-components
    this._searchStream = searchStream
    this._keyDownBus = keyDownBus
    this._changeBus = changeBus
    this._selectIndexBus = selectIndexBus
    this._scrollTopBus = scrollTopBus
    this._bodyHeightBus = bodyHeightBus
    this._focusBus = new Bacon.Bus()
    this._focusBus.plug(this.props.focusStream)
    this._focusBus.plug(this.props.openProjectPathStream) // will also enable the selection on first render

    // also expose some observables for caller (to assign side-effects outside of this scope)
    const calcPagination = R.curry(val => (val / this.state.rowHeight) | 0)
    this.paginationOffsetProp = scrollTopProp.map(calcPagination)
    this.paginationSizeProp = bodyHeightProp.map(R.pipe(calcPagination, R.add(2)))
    this.enterKeyStream = keyDownBus.filter(R.propEq('keyCode', 13)) // <enter>
    this.resetStream = resetStream
    this.bodyHeightProp = bodyHeightProp
    this.searchProp = searchProp

    this.selectedItemProp = Bacon.update(
      undefined,
      [resetStream], R.always(undefined),
      [selectedIndexProp.filter(R.is(Number)).changes(), this.props.resultsProp], (current, selectedIndex, r) => {
        // When index is changed the result might not yet have the prev/next item, in this case stick with current item
        const candidate = r.items[selectedIndex - r.paginationOffset]
        return candidate
          ? candidate
          : current
      },
      [this.props.resultsProp.changes(), selectedIndexProp], (_, r, selectedIndex) => {
        // Result is changed, change current item if necessary
        return selectedIndex >= 0
          ? r.items[selectedIndex - r.paginationOffset]
          : undefined
      }
    )

    this._updateRowHeight = debounce(() => {
      const $td = this.getDOMNode().getElementsByTagName('td')[0]
      if ($td) {
        this.setState({ // eslint-disable-line
          rowHeight: $td.offsetHeight
        })
      }
    }, 2000)
  },

  render () {
    const r = this.state.results
    const isLoading = this.state.parsingPathsCount > 0 || this.state.parsingPathsCount === null
    return (
      <div className='notational'>
        <div className='notational-loader' style={{ display: isLoading ? 'block' : 'none' }}>
          <ul className='background-message centered'>
            <li>
              Loading paths… <span className='loading loading-spinner-small inline-block'></span>
            </li>
          </ul>
        </div>
        <Search focusStream={this._focusBus}
          searchStream={this._searchStream}
          keyDownBus={this._keyDownBus}
          changeBus={this._changeBus}
        />
        <div className='notational-items'>
          <div className='header'>
            <table>
              <thead>
                <tr>
                  {this.state.columns.map((c) =>
                    <Th key={c.title} width={c.width + '%'} title={c.title} />
                  )}
                </tr>
              </thead>
            </table>
          </div>
          <ScrollableContent focusBus={this._focusBus}
              bodyHeight={this.state.bodyHeight} rowHeight={this.state.rowHeight}
              resultsTotal={r.total} resultsOffset={r.paginationOffset}
              scrollTop={this.state.scrollTop} scrollTopBus={this._scrollTopBus}>
            <table>
              <thead className='only-for-column-widths'>
                <tr>
                  {this.state.columns.map(c =>
                    <Th key={c.title} width={c.width + '%'} title='' />
                  )}
                </tr>
              </thead>
              <tbody className={classNames({'is-reversed-stripes': r.paginationOffset % 2 === 1})}>
                {r.items.map((item, i) => {
                  const index = r.paginationOffset + i
                  return (
                    <Item key={item.hrtime} item={item} isSelected={index === this.state.selectedIndex}
                        index={index} selectIndexBus={this._selectIndexBus}>
                      {this.state.columns.map(c => c.createCell(item, r))}
                    </Item>
                  )
                })}
              </tbody>
            </table>
          </ScrollableContent>
          <ResizeHandle bodyHeight={this.state.bodyHeight} bodyHeightBus={this._bodyHeightBus} />
        </div>
      </div>
    )
  },

  componentDidUpdate () {
    this._updateRowHeight()
  },

  componentWillUnmount () {
    this._updateRowHeight.cancel()
  }
})
