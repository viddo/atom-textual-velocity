'use babel'

import {React, ReactDOM} from 'react-for-atom'

export default React.createClass({

  propTypes: {
    initialVal: React.PropTypes.string,
    save: React.PropTypes.func,
    abort: React.PropTypes.func
  },

  getInitialState () {
    return { value: this.props.initialVal }
  },

  render () {
    return (
      <input ref='theInput' type='text' className='tv-input native-key-bindings'
        value={this.state.value} onChange={this._onChange} />
    )
  },

  componentDidMount () {
    const input = this._input()
    input.addEventListener('keydown', this._onKeyDown)
    input.select()
    input.focus()
  },

  componentWillUnmount () {
    this._input().removeEventListener('keydown', this._onKeyDown)
  },

  _input () {
    return ReactDOM.findDOMNode(this.refs.theInput)
  },

  _onChange (ev) {
    this.setState({ value: ev.target.value })
  },

  _onKeyDown (ev) {
    if (ev.keyCode === 13) { // <enter>
      if (this._hasChanged()) {
        this.props.save(this.state.value.trim())
      } else {
        this.props.abort()
      }
    } else if (ev.keyCode === 27) { // <esc>
      this.props.abort()
    }
  },

  _hasChanged () {
    return this.state.value !== this.props.initialVal && this.state.value.trim() !== this.props.initialVal
  }

})
