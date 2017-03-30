/* @flow */

import React from 'react'

type EditCellStrProps = {
  initialVal: string,
  save: Function,
  abort: Function
}

export default class EditCellStr extends React.Component {
  state: {
    value: string
  }

  props: EditCellStrProps
  input: HTMLInputElement

  _onKeyPress: (ev: KeyboardEvent) => void

  constructor (props: EditCellStrProps) {
    super(props)
    this.state = {value: props.initialVal}

    this._onKeyPress = ev => {
      if (ev.keyCode === 13) { // <enter>
        this._saveIfChangedOrAbort()
      } else if (ev.keyCode === 27) { // <esc>
        this.props.abort()
      }
    }
  }

  render () {
    return (
      <td className='edit-cell-str'>
        <input type='text' className='tv-input native-key-bindings'
          ref={input => {
            this.input = input
          }}
          value={this.state.value} onChange={this._onChange.bind(this)} onBlur={this._saveIfChangedOrAbort.bind(this)} />
      </td>
    )
  }

  componentDidMount () {
    this.input.addEventListener('keydown', this._onKeyPress)
    this.input.select()
    this.input.focus()
  }

  componentWillUnmount () {
    this.input.removeEventListener('keydown', this._onKeyPress)
  }

  _onChange (ev: any) {
    this.setState({ value: ev.target.value })
  }

  _saveIfChangedOrAbort () {
    if (this._hasChanged()) {
      this.props.save(this.state.value.trim())
    } else {
      this.props.abort()
    }
  }

  _hasChanged () {
    return this.state.value !== this.props.initialVal && this.state.value.trim() !== this.props.initialVal
  }
}
