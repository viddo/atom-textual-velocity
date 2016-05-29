'use babel'

import {React} from 'react-for-atom'

export default React.createClass({

  propTypes: {
    columns: React.PropTypes.array,
    rows: React.PropTypes.array,
    search: React.PropTypes.func,
    panelHeight: React.PropTypes.number
  },

  getInitialState () {
    return {
      columns: [],
      rows: []
    }
  },

  render () {
    return (
      <div className='textual-velocity'>
        <input type='text' className='tv-input tv-input--search native-key-bindings'
          onChange={ev => this.props.search(ev.target.value)}
          placeholder='Search, or press enter to create a new untitled file' />
        <div className='tv-items'>
          <div className='header'>
            <table>
              <thead>
                <tr>
                  {this.props.columns.map(c =>
                    <th key={c.key}>{c.title}</th>
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
                    <th key={c.key} style={{width: c.width + '%'}} />
                  )}
                </tr>
              </thead>
              <tbody className='is-reversed-stripes'>
                {this.props.rows.map(row => {
                  return (
                    <tr key={row.id}>
                      {this.props.columns.map(c => {
                        return (
                          <td key={c.key}>{row[c.key]}</td>
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
  }

})
