'use babel'

import {React} from 'react-for-atom'
import classNames from 'classnames'

export default React.createClass({

  propTypes: {
    columns: React.PropTypes.array.isRequired,
    hidden: React.PropTypes.bool
  },

  render () {
    const hidden = !!this.props.hidden
    return (
      <thead className={classNames({'only-for-column-widths': hidden})}>
        <tr>
          {this.props.columns.map(c =>
            <th key={c.key} style={{width: `${c.width}%`}}>
              {hidden ? '' : c.title}
            </th>
          )}
        </tr>
      </thead>
    )
  }

})
