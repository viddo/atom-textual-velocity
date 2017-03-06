/* @flow */

import {React, ReactDOM} from 'react-for-atom'
import {Subject} from 'rxjs'

type ScrollableListProps = {
  children?: any,
  scrollTop: number,
  itemsCount: number,
  listHeight: number,
  onScroll: Function,
  paginationStart: number,
  rowHeight: number
}

const privates = new WeakMap()

export default class ScrollableList extends React.Component {
  state: {
    forcedScroll: boolean,
    scrolling: boolean
  }

  props: ScrollableListProps

  constructor (props: ScrollableListProps) {
    super(props)
    this.state = {
      forcedScroll: false,
      scrolling: false
    }
  }

  componentWillMount () {
    const resetScrollingStateSubject = new Subject()
    const resetScrollingStateSubscription = resetScrollingStateSubject
      .debounceTime(400)
      .subscribe(() => {
        this.setState({scrolling: false})
      })

    const resetForcedScrollSubject = new Subject()
    const resetForcedScrollSubscription = resetForcedScrollSubject
      .debounceTime(100)
      .subscribe(() => {
        this.setState({forcedScroll: false})
      })

    privates.set(this, {
      resetScrollingStateSubject,
      resetScrollingStateSubscription,
      resetForcedScrollSubject,
      resetForcedScrollSubscription
    })
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
    if (nextProps.scrollTop !== ReactDOM.findDOMNode(this).scrollTop) {
      this.setState({forcedScroll: true})

      const {resetForcedScrollSubject} = privates.get(this) || {}
      resetForcedScrollSubject.next()
    }
  }

  componentDidUpdate () {
    const el = ReactDOM.findDOMNode(this)
    if (!this.state.scrolling && this.props.scrollTop !== el.scrollTop) {
      el.scrollTop = this.props.scrollTop
    }
  }

  compomentWillUnmount () {
    const {resetForcedScrollSubscription, resetScrollingStateSubscription} = privates.get(this) || {}

    resetForcedScrollSubscription.unsubscribe()
    resetScrollingStateSubscription.unsubscribe()

    privates.delete(this)
  }

  _onScroll (ev: any) {
    if (!this.state.forcedScroll) {
      if (!this.state.scrolling) {
        this.setState({scrolling: true})
      }

      this.props.onScroll(ev.target.scrollTop)

      const {resetScrollingStateSubject} = privates.get(this) || {}
      resetScrollingStateSubject.next()
    }
  }
}
