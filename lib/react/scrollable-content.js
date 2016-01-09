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
    resultsTotal: React.PropTypes.number,
    resultsOffset: React.PropTypes.number,
    scrollTop: React.PropTypes.number,
    scrollTopBus: React.PropTypes.object
  },

  getInitialState () {
    return { isScrolling: false }
  },

  componentWillMount () {
    this.onStreamsValues(this.props.scrollTopBus.debounce(50), () =>
      this.setState({ isScrolling: false })
    )
  },

  render () {
    return (
      <div onScroll={this._onScroll} onClick={this._onClick} style={{
        // Define the scrollable container
        height: this.props.bodyHeight,
        overflowY: 'scroll'}}>
        <div style={{
          // Calc total list height based on current total
          height: this.props.rowHeight * this.props.resultsTotal,
          position: 'relative'}}>
          <div style={{
            // Position current results chunk within the list based on its offset
            top: this.props.rowHeight * this.props.resultsOffset,
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
