/* @flow */

import Disposables from '../disposables'
import {React, ReactDOM} from 'react-for-atom'
import debounce from 'lodash.debounce'

type SearchProps = {
  focusOnEvents: boolean,
  query: string,
  onKeyPress: Function,
  onSearch: Function
}

const IS_INPUT_ELEMENT_REGEX = /INPUT|ATOM-TEXT-EDITOR/
const privates = new WeakMap()

export default class Search extends React.Component {

  props: SearchProps

  constructor (props: SearchProps) {
    super(props)

    const focusInput = debounce(() => {
      const searchInput = ReactDOM.findDOMNode(this)
      if (searchInput !== document.activeElement) {
        searchInput.select()
        searchInput.focus()
      }
    }, 50)

    privates.set(this, {
      focusInput,
      disposables: new Disposables(),
      onKeyPress: ev => this.props.onKeyPress(ev),

      focusInputUnlessTextEditorIsActive: () => {
        if (document.activeElement && this.props.focusOnEvents) {
          if (!IS_INPUT_ELEMENT_REGEX.test(document.activeElement.tagName)) {
            focusInput()
          }
        }
      }
    })
  }

  render () {
    return (
      <input type='text'
        value={this.props.query}
        className='tv-input tv-input--search native-key-bindings'
        placeholder='Search, or press enter to create a new untitled file'
        onChange={ev => this.props.onSearch(ev.target.value)} />
    )
  }

  componentDidMount () {
    const {disposables, focusInput, onKeyPress, focusInputUnlessTextEditorIsActive} = privates.get(this) || {}

    focusInputUnlessTextEditorIsActive()

    disposables.add(
      atom.commands.add('atom-workspace', 'textual-velocity:focus-on-search', focusInput),
      atom.commands.add('atom-workspace', 'textual-velocity:toggle-atom-window', focusInput),
      atom.commands.add('atom-workspace', 'textual-velocity:toggle-panel', focusInput)
    )

    // An evil necessary, due to https://github.com/atom/atom/blob/8eaaf40a2cffd9e091a420ca0634c9da9cf4b544/src/window-event-handler.coffee#L77
    // that prevents keydown events to propagate to React's event handler
    ReactDOM.findDOMNode(this).addEventListener('keydown', onKeyPress)
  }

  componentDidUpdate () {
    const {focusInputUnlessTextEditorIsActive} = privates.get(this) || {}
    focusInputUnlessTextEditorIsActive()
  }

  componentWillUnmount () {
    const {disposables, onKeyPress, focusInputUnlessTextEditorIsActive} = privates.get(this) || {}
    focusInputUnlessTextEditorIsActive.cancel()
    disposables.dispose()
    ReactDOM.findDOMNode(this).removeEventListener('keydown', onKeyPress)
  }

}
