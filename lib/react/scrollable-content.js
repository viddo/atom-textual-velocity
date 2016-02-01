'use babel'

import React from 'react-for-atom'
import BaconMixin from './baconjs-mixin'

export default React.createClass({

  mixins: [BaconMixin],

  propTypes: {
    children: React.PropTypes.element,
    focusBus: React.PropTypes.object,
    bodyHeight: React.PropTypes.number,
    rowHeight: React.PropTypes.number,
    itemsCount: React.PropTypes.number,
    offset: React.PropTypes.number,
    scrollTop: React.PropTypes.number,
    scrollTopBus: React.PropTypes.object
  },

  getInitialState () {
    return { isScrolling: false }
  },

  componentWillMount () {
    this.addBaconSideEffects(
      this.props.scrollTopBus
        .debounce(500)
        .onValue(() =>
          this.setState({ isScrolling: false })
        )
    )
  },

  render () {
    return (
      <div onScroll={this._onScroll} onClick={this._onClick} style={{
        // Define the scrollable container
        height: this.props.bodyHeight,
        overflowY: 'scroll'}}>
        <div style={{
          position: 'relative',

          // Calc list height based on current itemsCount
          height: this.props.rowHeight * this.props.itemsCount,

          // Disable pointer-events for smooth scrolling to work as expected
          pointerEvents: this.state.isScrolling ? 'none' : 'auto'}}>
          <div style={{
            // Position current results chunk within the list based on its offset
            top: this.props.rowHeight * this.props.offset,
            position: 'relative'}}>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  },

  componentDidUpdate () {
    if (!this.state.isScrolling) {
      React.findDOMNode(this).scrollTop = this.props.scrollTop
    }
  },

  _onScroll (ev) {
    this.setState({ isScrolling: true })
    this.props.scrollTopBus.push(ev.target.scrollTop)
  },

  _onClick () {
    this.props.focusBus.push(null)
  }

})
