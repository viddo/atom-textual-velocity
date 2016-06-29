'use babel'

import {React} from 'react-for-atom'
import classNames from 'classnames'

export default React.createClass({

  propTypes: {
    columns: React.PropTypes.array.isRequired,
    rows: React.PropTypes.array.isRequired,
    reverseStripes: React.PropTypes.bool.isRequired
  },

  render () {
    const columns = this.props.columns
    return (
      <table>
        <thead className='only-for-column-widths'>
          <tr>
            {this.props.columns.map(c => (
              <th key={c.key} style={{width: `${c.width}%`}}></th>))}
          </tr>
        </thead>
        <tbody className={classNames({'is-reversed-stripes': this.props.reverseStripes})}>
          {this.props.rows.map(row => (
            <tr key={row.id}>
              {columns.map(c => (
                <td key={c.key} style={{width: `${c.width}%`}}>
                  {c.renderCell && c.renderCell(row) || row[c.key]}
                </td>))}
            </tr>))}
        </tbody>
      </table>)
  }

})
