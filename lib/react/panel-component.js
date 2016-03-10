'use babel'

import Bacon from 'baconjs'
import R from 'ramda'
import {React, ReactDOM} from 'react-for-atom'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import getAdjustedScrollTop from '../get-adjusted-scroll-top'
import BaconMixin from './baconjs-mixin'
import ResizeHandleComponent from './resize-handle-component'
import ScrollableContentComponent from './scrollable-content-component'
import SearchComponent from './search-component'
import TheadThComponent from './thead-th-component'

export default React.createClass({

  mixins: [BaconMixin],

  propTypes: {
    columns: React.PropTypes.array,
    isLoadingFilesProp: React.PropTypes.object,
    panelHeightStream: React.PropTypes.object,
    focusOnSearchStream: React.PropTypes.object,
    filesProp: React.PropTypes.object,
    resultsProp: React.PropTypes.object,
    selectedIndexStream: React.PropTypes.object,
    selectIndexBus: React.PropTypes.object,
    keyDownBus: React.PropTypes.object
  },

  getInitialState () {
    return {
      searchStr: '',
      rowHeight: 25,
      panelHeight: 150,
      scrollTop: 0,
      paginationOffset: 0,
      visibleFiles: [],
      results: {
        total: 0,
        tokens: [],
        options: {
          sort: [{
            field: '',
            direction: ''
          }]
        }
      },
      selectedIndex: undefined
    }
  },

  componentWillMount () {
    const changeBus = this._changeBus = new Bacon.Bus()
    const searchStream = this._searchStream = changeBus
      .map('.target.value')
      .map(R.defaultTo(''))
    const searchProp = this.searchProp = searchStream.toProperty('')

    const panelHeightBus = this._panelHeightBus = new Bacon.Bus()
    panelHeightBus.plug(this.props.panelHeightStream)
    const panelHeightProp = this.panelHeightProp = panelHeightBus
      .skipDuplicates()
      .filter(newHeight => newHeight > 0)
      .toProperty(100)

    this._sortFieldBus = new Bacon.Bus()
    this._sortDirectionBus = new Bacon.Bus()
    this.sortFieldProp = this._sortFieldBus.toProperty()
    this.sortDirectionProp = this._sortDirectionBus.toProperty()

    const scrollTopBus = this._scrollTopBus = new Bacon.Bus()
    const scrollTopProp = Bacon
      .update(
        0,
        [this.props.selectedIndexStream.filter(R.is(Number))], (scrollTop, i) => {
          return getAdjustedScrollTop({
            rowHeight: this.state.rowHeight,
            panelHeight: this.state.panelHeight,
            scrollTop: scrollTop,
            selectedIndex: i
          })
        },
        [scrollTopBus.skipDuplicates()], R.nthArg(-1),
        [searchStream], R.always(0)
      )

    const calcPagination = val => (Math.max(0, val) / this.state.rowHeight) | 0
    const paginationOffsetProp = scrollTopProp.map(calcPagination)
    const visibleFilesProp = Bacon
      .combineTemplate({
        paginationOffset: paginationOffsetProp,
        paginationSize: panelHeightProp.map(calcPagination),
        resultsItems: this.props.resultsProp.map('.items'),
        files: this.props.filesProp
      })
      .map(d => {
        return d.resultsItems
          .slice(d.paginationOffset, d.paginationOffset + d.paginationSize + 2) // +2 to fill visible gap
          .map(({id}) => {
            const file = d.files[id]
            file.aHrTime = process.hrtime().toString() // to be used as key
            return file
          })
      })

    this.addBaconSideEffect(
      Bacon.combineTemplate({
        isLoadingFiles: this.props.isLoadingFilesProp
      })
      .onValue(this.setState.bind(this)))

    this.addBaconSideEffect(
      Bacon.combineTemplate({
        panelHeight: panelHeightProp,
        scrollTop: scrollTopProp,
        visibleFiles: visibleFilesProp,
        paginationOffset: paginationOffsetProp,
        results: this.props.resultsProp,
        searchStr: searchProp,
        selectedIndex: this.props.selectedIndexStream
      })
      .onValue(this.setState.bind(this)))
  },

  componentDidMount () {
    // The actual rowHeight will vary depending on window size (and on resize/screen changes),
    // so in lieu of a better solution, for now poll changes and update if necessary
    this._updateRowHeight = debounce(() => {
      const $td = ReactDOM.findDOMNode(this).getElementsByTagName('td')[0]
      if ($td) {
        const rowHeight = $td.offsetHeight
        if (rowHeight !== this.state.rowHeight) {
          this.setState({ rowHeight: rowHeight })
        }
      }
    }, 3000)
  },

  render () {
    const sort = this.state.results.options.sort[0]
    return (
      <div className='textual-velocity'>
        <div className='tv-loader' style={{ display: this.state.isLoadingFiles ? 'block' : 'none' }}>
          <ul className='background-message centered'>
            <li>
              Loading notes… <span className='loading loading-spinner-small inline-block'></span>
            </li>
          </ul>
        </div>
        <SearchComponent
            focusOnSearchStream={this.props.focusOnSearchStream}
            searchStream={this._searchStream}
            keyDownBus={this.props.keyDownBus}
            changeBus={this._changeBus}
          />
        <div className='tv-items'>
          <div className='header'>
            <table>
              <thead>
                <tr>
                  {this.props.columns.map(c =>
                    <TheadThComponent key={c.title} column={c}
                      sortFieldBus={this._sortFieldBus}
                      sortDirectionBus={this._sortDirectionBus}
                      sortDirection={sort.direction}
                      isSelected={c.sortField === sort.field} />
                  )}
                </tr>
              </thead>
            </table>
          </div>
          <ScrollableContentComponent
              panelHeight={this.state.panelHeight} rowHeight={this.state.rowHeight}
              itemsCount={this.state.results.total} offset={this.state.paginationOffset}
              scrollTop={this.state.scrollTop} scrollTopBus={this._scrollTopBus}>
            <table>
              <thead className='only-for-column-widths'>
                <tr>
                  {this.props.columns.map(c =>
                    <th key={c.title} style={{width: c.width + '%'}} />
                  )}
                </tr>
              </thead>
              <tbody className={classNames({'is-reversed-stripes': this.state.paginationOffset % 2 === 1})}>
                {this.state.visibleFiles.map((file, i) => {
                  const index = this.state.paginationOffset + i
                  const isSelected = index === this.state.selectedIndex
                  return (
                    <tr key={file.aHrTime} className={classNames({'is-selected': isSelected})}
                          onClick={() => { this.props.selectIndexBus.push(index) }}>
                      {this.props.columns.map(c => c.createCell(file, this.state, isSelected))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ScrollableContentComponent>
          <ResizeHandleComponent panelHeight={this.state.panelHeight} panelHeightBus={this._panelHeightBus} />
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
