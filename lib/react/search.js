'use babel'

import {React, ReactDOM} from 'react-for-atom'
import debounce from 'lodash.debounce'

const FOCUS_ON_SEARCH_DELAY_MS = 50

export default React.createClass({

  propTypes: {
    focusSearchInput: React.PropTypes.bool,
    onSearch: React.PropTypes.func.isRequired
  },

  componentWillMount () {
    this._focusSearchInput = debounce(() => {
      if (this.props.focusSearchInput) {
        const searchInput = ReactDOM.findDOMNode(this.refs.searchInput)
        searchInput.select()
        searchInput.focus()
      }
    }, FOCUS_ON_SEARCH_DELAY_MS)
  },

  render () {
    return (
      <input ref='searchInput' type='text'
        className='tv-input tv-input--search native-key-bindings'
        placeholder='Search, or press enter to create a new untitled file'
        onChange={ev => this.props.onSearch(ev.target.value)} />
    )
  },

  componentDidMount () {
    this._focusSearchInput()
  },

  componentDidUpdate () {
    this._focusSearchInput()
  },

  componentWillUnmount () {
    this._focusSearchInput.cancel()
  }

})
