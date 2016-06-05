'use babel'

import {React} from 'react-for-atom'
import classNames from 'classnames'
import TableColumnsHeader from './table-columns-header'

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
        <TableColumnsHeader columns={columns} hidden />
        <tbody className={classNames({'is-reversed-stripes': this.props.reverseStripes})}>
          {this.props.rows.map(row => {
            return (
              <tr key={row.id}>
                {columns.map(c => {
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
    )
  }

})
