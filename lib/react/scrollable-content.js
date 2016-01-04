'use babel'

import React from 'react-for-atom'

export default React.createClass({

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
    if (this.props.scrollTop === 0) {
      React.findDOMNode(this).scrollTop = 0
    }
  },

  _onScroll (ev) {
    this.props.scrollTopBus.push(ev.target.scrollTop)
  },

  _onClick () {
    this.props.focusBus.push(null)
  }

})
