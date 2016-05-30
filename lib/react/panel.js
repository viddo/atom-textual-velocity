'use babel'

import {React, ReactDOM} from 'react-for-atom'
import debounce from 'lodash.debounce'

export default React.createClass({

  propTypes: {
    columns: React.PropTypes.array,
    rows: React.PropTypes.array,
    search: React.PropTypes.func,
    panelHeight: React.PropTypes.number,
    focusSearchInput: React.PropTypes.bool
  },

  componentWillMount () {
    this._focusSearchInput = debounce(() => {
      if (this.props.focusSearchInput) {
        const searchInput = ReactDOM.findDOMNode(this.refs.searchInput)
        searchInput.select()
        searchInput.focus()
      }
    }, 50)
  },

  render () {
    return (
      <div className='textual-velocity'>
        <input ref='searchInput' type='text' className='tv-input tv-input--search native-key-bindings'
          onChange={ev => this.props.search(ev.target.value)}
          placeholder='Search, or press enter to create a new untitled file' />
        <div className='tv-items'>
          <div className='header'>
            <table>
              <thead>
                <tr>
                  {this.props.columns.map(c =>
                    <th key={c.key} style={{width: `${c.width}%`}}>
                      {c.title}
                    </th>
                  )}
                </tr>
              </thead>
            </table>
          </div>
          <div style={{height: this.props.panelHeight}}>
            <table>
              <thead className='only-for-column-widths'>
                <tr>
                  {this.props.columns.map(c =>
                    <th key={c.key} style={{width: `${c.width}%`}} />
                  )}
                </tr>
              </thead>
              <tbody className='is-reversed-stripes'>
                {this.props.rows.map(row => {
                  return (
                    <tr key={row.id}>
                      {this.props.columns.map(c => {
                        return (
                          <td key={c.key} style={{width: `${c.width}%`}}>
                            {row[c.key]}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
