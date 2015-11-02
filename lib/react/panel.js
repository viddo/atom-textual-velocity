'use babel'

import React from 'react-for-atom'
import Bacon from 'baconjs'
import R from 'ramda'
import classNames from 'classnames'
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
    bodyHeightStream: React.PropTypes.object,
    showStream: React.PropTypes.object,
    itemsProp: React.PropTypes.object,
    countProp: React.PropTypes.object
  },

  getInitialState () {
    return {
      rowHeight: 25,
      bodyHeight: 100,
      scrollTop: 0,
      itemsCount: 0,
      // TODO mapped version of titles, calculated widths, createCell
      columns: [
        {
          title: 'Name',
          width: 60,
          createCell: item => <Summary title={item.title} />
        }, {
          title: 'Date modified',
          width: 20,
          createCell: item => <DateTime date={item.mtime} />
        }, {
          title: 'Date created',
          width: 20,
          createCell: item => <DateTime date={item.ctime} />
        }
      ],
      visibleItems: [],
      reverseStripes: true,
      selectedItem: null
    }
  },

  componentWillMount () {
    let selectItemBus = new Bacon.Bus()
    let changeBus = new Bacon.Bus()
    let keyDownBus = new Bacon.Bus()
    let bodyHeightBus = new Bacon.Bus()

    let resetStream = keyDownBus.filter(ev => ev.keyCode === 27).map('') // <esc>
    let searchStream = changeBus.map('.target.value').merge(resetStream)
    let searchProp = searchStream.toProperty('')

    bodyHeightBus.plug(this.props.bodyHeightStream)
    let bodyHeightProp = bodyHeightBus.skipDuplicates().filter(newHeight => newHeight > 0).toProperty(100)

    // let selectPrevStream = keyDownBus.filter(ev => ev.keyCode === 38).doAction('.preventDefault') // <up>
    // let selectNextStream = keyDownBus.filter(ev => ev.keyCode === 40).doAction('.preventDefault') // <down>
    // let selectOffsetStream = selectPrevStream.map(-1).merge(selectNextStream.map(1))

    let selectedItemProp = Bacon.update(null,
      [searchStream], R.always(null),
      [selectItemBus], R.nthArg(-1),
      // [selectOffsetStream, this.props.itemsProp], (currentSelectedItem, selectOffset, items) => {
      //   let newIndex = items.indexOf(currentSelectedItem) + selectOffset
      //   if (newIndex >= 0) {
      //     // Get next, but stop if reached last item
      //     newIndex = newIndex < items.length
      //       ? newIndex
      //       : newIndex - 1
      //   } else {
      //     // Get prev until reaching first item, or cycle to last item if there is no selection
      //     newIndex = currentSelectedItem === null
      //       ? items.length - 1
      //       : 0
      //   }
      //
      //   return items[newIndex]
      // }
    ).skipDuplicates()

    let scrollTopBus = new Bacon.Bus()
    let scrollTopProp = Bacon.update(0,
      [scrollTopBus], R.nthArg(-1),
      [searchStream], R.always(0),
    //   [selectedItemProp.changes(), this.props.itemsProp], (currentScrollTop, selectedItem, items) => {
    //     // Adjust scrollTop for selected item
    //     if (!selectedItem) return currentScrollTop
    //     let selectedScrollTop = items.indexOf(selectedItem) * this.state.rowHeight
    //     if (currentScrollTop > selectedScrollTop) {
    //       // selected item is located before the visible bounds
    //       // from: ..X..[...]..
    //       // to:   .[X..]......
    //       return selectedScrollTop
    //     } else if (currentScrollTop + this.state.bodyHeight <= selectedScrollTop) {
    //       // selected item is located after the visible bounds
    //       // from: ..[...]..X..
    //       // to:   ......[..X].
    //       return selectedScrollTop - this.state.bodyHeight + this.state.rowHeight
    //     } else {
    //       // selected item is located within the visible bounds, just return the current scrollTop value
    //       return currentScrollTop
    //     }
    //   }
    )

    this.onStreamsValues(
      bodyHeightProp, scrollTopProp, searchProp, selectedItemProp,
      this.props.itemsProp, this.props.countProp,
      (bodyHeight, scrollTop, searchStr, selectedItem, items, count) => {
        // let visibleBegin = (scrollTop / this.state.rowHeight) | 0
        // let visibleEnd = visibleBegin + ((bodyHeight / this.state.rowHeight) | 0) + 2 // add 2 to avoid scroll flicker
        this.setState({
          bodyHeight: bodyHeight,
          scrollTop: scrollTop,
          itemsCount: count || 0,
          // visibleItems: items.slice(visibleBegin, visibleEnd),
          visibleItems: items || [], // items.slice(visibleBegin, visibleEnd),
          reverseStripes: false,
          // reverseStripes: visibleBegin % 2 === 0,
          selectedItem: selectedItem
        })
      }
    )

    // expose some observables for sub-components
    this._searchStream = searchStream
    this._keyDownBus = keyDownBus
    this._changeBus = changeBus
    this._selectItemBus = selectItemBus
    this._scrollTopBus = scrollTopBus
    this._bodyHeightBus = bodyHeightBus
    this._focusBus = new Bacon.Bus()
    this._focusBus.plug(this.props.showStream)

    // also expose some observables for caller (to assign side-effects outside of this scope)
    this.openStream = keyDownBus.filter(ev => ev.keyCode === 13) // <enter>
    this.resetStream = resetStream
    this.bodyHeightProp = bodyHeightProp
    this.guaranteedSelectedItemProp = selectedItemProp.filter(candidate => !!candidate)
    this.searchProp = searchProp

    const calculatePageItems = R.curry(val => (val / this.state.rowHeight) | 0)
    this.pageOffsetProp = scrollTopProp.map(calculatePageItems)
    this.pageSizeProp = bodyHeightProp.map(calculatePageItems)
  },

  render () {
    return (
      <div className='notational'>
        <Search showStream={this.props.showStream.merge(this._focusBus)}
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
                    <Th width={c.width} title={c.title} />
                  )}
                </tr>
              </thead>
            </table>
          </div>
          <ScrollableContent itemsCount={this.state.itemsCount} focusBus={this._focusBus}
              bodyHeight={this.state.bodyHeight} rowHeight={this.state.rowHeight}
              scrollTop={this.state.scrollTop} scrollTopBus={this._scrollTopBus}>
            <table>
              <thead className='only-for-column-widths'>
                <tr>
                  {this.state.columns.map(c =>
                    <Th width={c.width} title='' />
                  )}
                </tr>
              </thead>
              <tbody className={classNames({'is-reversed-stripes': this.state.reverseStripes})}>
                {this.state.visibleItems.map(item => {
                  return (
                    <Item item={item} isSelected={item === this.state.selectedItem} selectItemBus={this._selectItemBus}>
                      {this.state.columns.map((c) => c.createCell(item))}
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
  }

})