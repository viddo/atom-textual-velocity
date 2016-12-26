/* @flow */

import {React, ReactDOM} from 'react-for-atom'

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
        <input ref='theInput' type='text' className='tv-input native-key-bindings'
          value={this.state.value} onChange={this._onChange.bind(this)} onBlur={this._saveIfChangedOrAbort.bind(this)} />
      </td>)
  }

  componentDidMount () {
    const input = this._input()
    input.addEventListener('keydown', this._onKeyPress)
    input.select()
    input.focus()
  }

  componentWillUnmount () {
    this._input().removeEventListener('keydown', this._onKeyPress)
  }

  _input () {
    return ReactDOM.findDOMNode(this.refs.theInput)
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
