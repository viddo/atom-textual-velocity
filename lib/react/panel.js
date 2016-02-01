'use babel'

import React from 'react-for-atom'
import Bacon from 'baconjs'
import R from 'ramda'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import getAdjustedScrollTop from '../get-adjusted-scroll-top'
import Search from './search'
import ScrollableContent from './scrollable-content'
import ResizeHandle from './resize-handle'
import Th from './th'
import File from './file'
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
    filesProp: React.PropTypes.object,
    resultsProp: React.PropTypes.object
  },

  getInitialState () {
    return {
      searchStr: '',
      rowHeight: 25,
      bodyHeight: 100,
      scrollTop: 0,
      paginationOffset: 0,
      visibleFiles: [],
      // TODO mapped version of titles, calculated widths, createCell
      columns: [
        {
          title: 'Name',
          width: 70,
          createCell: file => <Summary key='name' file={file}
            searchStr={this.state.searchStr} results={this.state.results} />
        }, {
          title: 'Date modified',
          width: 15,
          createCell: file => <DateTime key='mtime' time={file.stat.mtime} />
        }, {
          title: 'Date created',
          width: 15,
          createCell: file => <DateTime key='birhtime' time={file.stat.birthtime} />
        }
      ],
      results: {
        total: 0,
        tokens: []
      },
      selectedIndex: undefined,
      parsingPathsCount: null
    }
  },

  componentWillMount () {
    const resultsProp = this.props.resultsProp
    const filesProp = this.props.filesProp

    const selectIndexBus = new Bacon.Bus()
    const changeBus = new Bacon.Bus()
    const keyDownBus = new Bacon.Bus()
    const bodyHeightBus = new Bacon.Bus()

    const escKeyStream = keyDownBus.filter(R.propEq('keyCode', 27)) // <esc>
    const searchStream = changeBus.map('.target.value').merge(escKeyStream.map(''))
    const searchProp = searchStream.toProperty('')

    bodyHeightBus.plug(this.props.bodyHeightStream)
    const bodyHeightProp = bodyHeightBus.skipDuplicates().filter(newHeight => newHeight > 0).toProperty(100)

    const selectNextStream = keyDownBus.filter(R.propEq('keyCode', 40)).doAction('.preventDefault') // <down>
    const selectPrevStream = keyDownBus.filter(R.propEq('keyCode', 38)).doAction('.preventDefault') // <up>

    // Selection is a semi-complicated piece; Keep an internal datastucture that keep tabs on path/item/index,
    // to be able to re-calculate them on state changes
    const selectedProp = Bacon
      .update(
        {},
        // Deselect on search and ESC key
        [searchStream], R.always({}),
        [escKeyStream], R.always({}),
        // Selected next item
        [selectNextStream, filesProp, resultsProp], (current, _, files, {items}) => {
          const i = R.defaultTo(-1, current.index) + 1 // start on first item
          const nextItem = items[i]
          if (nextItem) {
            return {
              item: nextItem,
              path: files[nextItem.id].path,
              index: i
            }
          } else {
            return current // stop when reaching last item
          }
        },
        // Select prev item
        [selectPrevStream, filesProp, resultsProp], (current, _, files, {items}) => {
          const i = R.defaultTo(items.length, current.index) - 1 // start on last item
          const prevItem = items[i]
          if (prevItem) {
            return {
              item: prevItem,
              path: files[prevItem.id].path,
              index: i
            }
          } else {
            return current // stop when reaching first item
          }
        },
        // User clicks on one of the visible item, change to that one directly
        [selectIndexBus, filesProp, resultsProp], (_, i, files, {items}) => {
          const item = items[i]
          return {
            item: item,
            path: files[item.id].path,
            index: i
          }
        },
        // Files changes (add/delete/order), update index from known path from current
        [filesProp.changes(), resultsProp], (current, files, {items}) => {
          const currentPath = current.path
          if (currentPath) {
            const i = items.findIndex(({id}) => files[id].path === currentPath)
            return {
              item: items[i],
              path: current.path,
              index: i
            }
          } else {
            return current // stay with current
          }
        }
      ).skipDuplicates()

    const scrollTopBus = new Bacon.Bus()
    const scrollTopProp = Bacon
      .update(
        0,
        [selectedProp.changes().map('.index').filter(R.is(Number))], (scrollTop, i) => {
          return getAdjustedScrollTop({
            rowHeight: this.state.rowHeight,
            bodyHeight: this.state.bodyHeight,
            scrollTop: scrollTop,
            selectedIndex: i
          })
        },
        [scrollTopBus.skipDuplicates()], R.nthArg(-1),
        [searchStream], R.always(0)
      )

    const calcPagination = val => (val / this.state.rowHeight) | 0
    const paginationOffsetProp = scrollTopProp.map(calcPagination)
    const visibleFilesProp = Bacon
      .combineTemplate({
        paginationOffset: paginationOffsetProp,
        paginationSize: bodyHeightProp.map(calcPagination),
        resultsItems: resultsProp.map('.items'),
        files: this.props.filesProp
      })
      .map(d => {
        return d.resultsItems
          .slice(d.paginationOffset, d.paginationOffset + d.paginationSize + 2) // +2 to fill visible gap
          .map(({id}) => {
            const file = d.files[id]
            file.aHrTime = process.hrtime().toString()
            return file
          })
      })

    this.addBaconSideEffects(
      Bacon.combineTemplate({
        bodyHeight: bodyHeightProp,
        scrollTop: scrollTopProp,
        visibleFiles: visibleFilesProp,
        paginationOffset: paginationOffsetProp,
        results: resultsProp,
        searchStr: searchProp,
        selectedIndex: selectedProp.map('.index')
      })
      .onValue(state => {
        this.setState(state)
      }),

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
    this.enterKeyStream = keyDownBus.filter(R.propEq('keyCode', 13)) // <enter>
    this.bodyHeightProp = bodyHeightProp
    this.searchProp = searchProp
    this.selectedFileProp = Bacon
      .combineWith(selectedProp, filesProp, (selected, files) => {
        const id = R.path(['item', 'id'], selected)
        return files[id]
      })

    this._updateRowHeight = debounce(() => {
      const $td = this.getDOMNode().getElementsByTagName('td')[0]
      if ($td) {
        this.setState({
          rowHeight: $td.offsetHeight
        })
      }
    }, 2000)
  },

  render () {
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
              itemsCount={this.state.results.total} offset={this.state.paginationOffset}
              scrollTop={this.state.scrollTop} scrollTopBus={this._scrollTopBus}>
            <table>
              <thead className='only-for-column-widths'>
                <tr>
                  {this.state.columns.map(c =>
                    <Th key={c.title} width={c.width + '%'} title='' />
                  )}
                </tr>
              </thead>
              <tbody className={classNames({'is-reversed-stripes': this.state.paginationOffset % 2 === 1})}>
                {this.state.visibleFiles.map((file, i) => {
                  const index = this.state.paginationOffset + i
                  return (
                    <File key={file.aHrTime} file={file} isSelected={index === this.state.selectedIndex}
                        index={index} selectIndexBus={this._selectIndexBus}>
                      {this.state.columns.map(c => c.createCell.call(this, file))}
                    </File>
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
