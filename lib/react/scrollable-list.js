'use babel'

import {React, ReactDOM} from 'react-for-atom'
import debounce from 'lodash.debounce'

const STOPPED_SCROLLING_AFTER_MS = 400

export default React.createClass({

  propTypes: {
    listHeight: React.PropTypes.number.isRequired,
    rowHeight: React.PropTypes.number.isRequired,
    itemsCount: React.PropTypes.number.isRequired,
    paginationStart: React.PropTypes.number.isRequired,
    onScroll: React.PropTypes.func.isRequired,
    forcedScrollTop: React.PropTypes.number.isRequired,
    children: React.PropTypes.element.isRequired
  },

  getInitialState () {
    return {
      forcedScroll: false,
      scrolling: false,
      rowHeight: 20
    }
  },

  componentWillMount () {
    this._debouncedResetScrollingState = debounce(() => {
      this.setState({ scrolling: false })
    }, STOPPED_SCROLLING_AFTER_MS)
  },

  componentWillReceiveProps (nextProps) {
    // If next scrollTop value doesn't match current it means it's a "forced scroll" from somewhere else
    // So indicate this to avoid pushing additional scroll
    // Will be reset after the debounce
    if (!isNaN(parseInt(nextProps.forcedScrollTop)) && nextProps.forcedScrollTop !== ReactDOM.findDOMNode(this).scrollTop) {
      this.setState({forcedScroll: true})
    }
  },

  render () {
    return (
      <div onScroll={this._onScroll} style={{
        height: this.props.listHeight,
        overflowY: 'scroll'
      }}>
        <div style={{
          position: 'relative',
          height: this.props.rowHeight * this.props.itemsCount,

          // Disable pointer-events for smooth scrolling to work as expected
          // From https://github.com/facebook/react/issues/2295#issuecomment-104944111
          pointerEvents: this.state.scrolling ? 'none' : 'auto'}}>
          <div style={{
            // Position current results chunk within the list based on its pagination start
            top: this.props.rowHeight * this.props.paginationStart,
            position: 'relative'
          }}>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  },

  componentDidUpdate () {
    if (this.state.forcedScroll) {
      ReactDOM.findDOMNode(this).scrollTop = this.props.scrollTop
      this.setState({forcedScroll: false})
    }
  },

  _onScroll (ev) {
    if (!this.state.forcedScroll) {
      this.props.onScroll(ev.target.scrollTop)

      if (!this.state.scrolling) {
        this.setState({ scrolling: true })
      }

      this._debouncedResetScrollingState()
    }
  }

})
