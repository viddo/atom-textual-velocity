'use babel'

import {React, ReactDOM} from 'react-for-atom'
import Bacon from 'baconjs'
import R from 'ramda'
import BaconMixin from './baconjs-mixin'

export default React.createClass({

  mixins: [BaconMixin],

  propTypes: {
    focusOnSearchStream: React.PropTypes.object,
    searchStream: React.PropTypes.object,
    changeBus: React.PropTypes.object,
    keyDownBus: React.PropTypes.object
  },

  getInitialState () {
    return { searchStr: '' }
  },

  render () {
    return (
      <input ref='theInput' type='text' className='tv-input tv-input--search native-key-bindings'
        value={this.state.searchStr}
        onChange={this._onChange}
        placeholder='Search, or press enter to create a new untitled file' />
    )
  },

  componentDidMount () {
    this.addBaconSideEffect(
      Bacon.combineTemplate({
        searchStr: this.props.searchStream.toProperty('')
      })
      .onValue(this.setState.bind(this)))

    this.addBaconSideEffect(
      this.props.focusOnSearchStream
        .debounce(50)
        .onValue(() => {
          const input = this._input()
          input.select()
          input.focus()
        }))

    // Reset search on <esc>
    this.addBaconSideEffect(
      this.props.keyDownBus
        .filter(R.propEq('keyCode', 27))
        .onValue(() => {
          this.props.changeBus.push('')
        }))

    // An evil necessary, due to https://github.com/atom/atom/blob/8eaaf40a2cffd9e091a420ca0634c9da9cf4b544/src/window-event-handler.coffee#L77
    // that prevents keydown events to propagate to React's event handler
    this._input().addEventListener('keydown', this._onKeyDown)
  },

  componentWillUnmount () {
    this._input().removeEventListener('keydown', this._onKeyDown)
  },

  _onKeyDown (ev) {
    this.props.keyDownBus.push(ev)
  },

  _onChange (ev) {
    this.props.changeBus.push(ev)
  },

  _input () {
    return ReactDOM.findDOMNode(this.refs.theInput)
  }

})
