'use babel'

import {React, ReactDOM} from 'react-for-atom'
import Bacon from 'baconjs'
import R from 'ramda'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import getAdjustedScrollTop from '../get-adjusted-scroll-top'
import Search from './search-component'
import ScrollableContent from './scrollable-content-component'
import ResizeHandle from './resize-handle-component'
import Th from './th-component'
import File from './file-component'
import BaconMixin from './baconjs-mixin'

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
    keyDownBus: React.PropTypes.object,
    selectIndexBus: React.PropTypes.object
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
        tokens: []
      },
      selectedIndex: undefined
    }
  },

  componentWillMount () {
    const changeBus = this._changeBus = new Bacon.Bus()
    const searchStream = this._searchStream = changeBus
      .map('.target.value').map(R.defaultTo(''))
      .doLog('[react/panel._searchStream]')
    const searchProp = this.searchProp = searchStream.toProperty('').doLog('[react/panel.searchProp]')

    const panelHeightBus = this._panelHeightBus = new Bacon.Bus()
    panelHeightBus.plug(this.props.panelHeightStream)
    const panelHeightProp = this.panelHeightProp = panelHeightBus
      .skipDuplicates()
      .filter(newHeight => newHeight > 0)
      .toProperty(100)

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
    return (
      <div className='textual-velocity'>
        <div className='tv-loader' style={{ display: this.state.isLoadingFiles ? 'block' : 'none' }}>
          <ul className='background-message centered'>
            <li>
              Loading notes… <span className='loading loading-spinner-small inline-block'></span>
            </li>
          </ul>
        </div>
        <Search
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
                  {this.props.columns.map((c) =>
                    <Th key={c.title} width={c.width + '%'} title={c.title} />
                  )}
                </tr>
              </thead>
            </table>
          </div>
          <ScrollableContent
              panelHeight={this.state.panelHeight} rowHeight={this.state.rowHeight}
              itemsCount={this.state.results.total} offset={this.state.paginationOffset}
              scrollTop={this.state.scrollTop} scrollTopBus={this._scrollTopBus}>
            <table>
              <thead className='only-for-column-widths'>
                <tr>
                  {this.props.columns.map(c =>
                    <Th key={c.title} width={c.width + '%'} title='' />
                  )}
                </tr>
              </thead>
              <tbody className={classNames({'is-reversed-stripes': this.state.paginationOffset % 2 === 1})}>
                {this.state.visibleFiles.map((file, i) => {
                  const index = this.state.paginationOffset + i
                  const isSelected = index === this.state.selectedIndex
                  return (
                    <File key={file.aHrTime} file={file} isSelected={isSelected}
                        index={index} selectIndexBus={this.props.selectIndexBus}>
                      {this.props.columns.map(c => c.createCell(file, this.state, isSelected))}
                    </File>
                  )
                })}
              </tbody>
            </table>
          </ScrollableContent>
          <ResizeHandle panelHeight={this.state.panelHeight} panelHeightBus={this._panelHeightBus} />
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
