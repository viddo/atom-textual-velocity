/* @flow */

import {React, ReactDOM} from 'react-for-atom'
import debounce from 'lodash.debounce'

type ScrollableListProps = {
  children?: any,
  forcedScrollTop: ?number,
  itemsCount: number,
  listHeight: number,
  onScroll: Function,
  paginationStart: number,
  rowHeight: number
}

export default class ScrollableList extends React.Component {

  state: {
    forcedScroll: boolean,
    scrolling: boolean
  }

  props: ScrollableListProps

  _debouncedResetScrollingState: any
  _debouncedResetForcedScroll: any

  constructor (props: ScrollableListProps) {
    super(props)
    this.state = {
      forcedScroll: false,
      scrolling: false
    }
  }

  componentWillMount () {
    this._debouncedResetScrollingState = debounce(() => {
      this.setState({scrolling: false})
    }, 400)

    this._debouncedResetForcedScroll = debounce(() => {
      this.setState({forcedScroll: false})
    }, 100)
  }

  render () {
    return (
      <div onScroll={this._onScroll.bind(this)} style={{
        height: this.props.listHeight,
        overflowY: 'scroll'
      }}>
        <div style={{
          position: 'relative',
          height: this.props.rowHeight * this.props.itemsCount, // full height

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
  }

  componentWillReceiveProps (nextProps: ScrollableListProps) {
    // If next scrollTop value doesn't match current it means it's a "forced scroll" from somewhere else
    // So indicate this to avoid pushing additional scroll
    // Will be reset after the debounce
    if (Number.isInteger(nextProps.forcedScrollTop) && nextProps.forcedScrollTop !== ReactDOM.findDOMNode(this).scrollTop) {
      this.setState({forcedScroll: true})
      this._debouncedResetForcedScroll()
    }
  }

  componentDidUpdate () {
    if (Number.isInteger(this.props.forcedScrollTop) && !this.state.scrolling) {
      ReactDOM.findDOMNode(this).scrollTop = this.props.forcedScrollTop
    }
  }

  compomentWillUnmount () {
    this._debouncedResetScrollingState.cancel()
    this._debouncedResetForcedScroll.cancel()
  }

  _onScroll (ev: any) {
    if (!this.state.forcedScroll) {
      this.setState({scrolling: true})
      this.props.onScroll(ev.target.scrollTop)
      this._debouncedResetScrollingState()
    }
  }

}
