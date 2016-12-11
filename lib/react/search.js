'use babel'

import {React, ReactDOM} from 'react-for-atom'
import debounce from 'lodash.debounce'
import R from 'ramda'

const IS_INPUT_ELEMENT_REGEX = /INPUT|ATOM-TEXT-EDITOR/

export default React.createClass({

  propTypes: {
    str: React.PropTypes.string.isRequired,
    onKeyDown: React.PropTypes.func.isRequired,
    onSearch: React.PropTypes.func.isRequired
  },

  componentWillMount () {
    this._focusSearchInput = debounce(() => {
      if (IS_INPUT_ELEMENT_REGEX.test(R.path(['activeElement', 'tagName'], document))) return

      const searchInput = this._input()
      if (searchInput !== document.activeElement) {
        searchInput.select()
        searchInput.focus()
      }
    }, 50)
  },

  render () {
    this._focusSearchInput()
    return (
      <input type='text'
        value={this.props.str}
        className='tv-input tv-input--search native-key-bindings'
        placeholder='Search, or press enter to create a new untitled file'
        onChange={ev => this.props.onSearch(ev.target.value)} />
    )
  },

  componentDidMount () {
    // An evil necessary, due to https://github.com/atom/atom/blob/8eaaf40a2cffd9e091a420ca0634c9da9cf4b544/src/window-event-handler.coffee#L77
    // that prevents keydown events to propagate to React's event handler
    this._input().addEventListener('keydown', this._onKeyDown)
    this._focusSearchInput()
  },

  componentDidUpdate () {
    this._focusSearchInput()
  },

  componentWillUnmount () {
    this._focusSearchInput.cancel()
    this._input().removeEventListener('keydown', this._onKeyDown)
  },

  _onKeyDown (ev) {
    this.props.onKeyDown(ev)
  },

  _input () {
    return ReactDOM.findDOMNode(this)
  }

})
