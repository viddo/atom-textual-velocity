'use babel'

import React from 'react-for-atom'
import R from 'ramda'

export default React.createClass({

  propTypes: {
    bodyHeight: React.PropTypes.number,
    rowHeight: React.PropTypes.number,
    scrollTop: React.PropTypes.number,
    itemsCount: React.PropTypes.number,
    scrollTopBus: React.PropTypes.object,
    focusBus: React.PropTypes.object
  },

  render () {
    return (
      <div className='tbody' style={{height: this.props.bodyHeight}} onScroll={this._onScroll} onClick={this._onClick}>
        <div className='tinner-body'
            style={{
              height: this.props.bodyHeight,
              top: R.pipe(R.modulo, R.negate)(this.props.scrollTop)(this.props.rowHeight),
              marginTop: this.props.scrollTop,
              marginBottom: this.props.itemsCount * this.props.rowHeight - this.props.scrollTop - this.props.bodyHeight
            }}>
          {this.props.children}
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
