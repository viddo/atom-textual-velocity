'use babel'

import {React} from 'react-for-atom'
import TableColumn from './table-column'

export default React.createClass({

  propTypes: {
    columns: React.PropTypes.array.isRequired,
    sort: React.PropTypes.object,
    onSortByField: React.PropTypes.func,
    onChangeSortDirection: React.PropTypes.func
  },

  render () {
    const sortField = this.props.sort.field
    return (
      <thead>
        <tr>
          {this.props.columns.map(c => {
            return (
              <TableColumn key={c.title} column={c} sortDirection={this.props.sort.direction}
                isSelected={c.sortField === sortField}
                onSortByField={this.props.onSortByField}
                onChangeSortDirection={this.props.onChangeSortDirection} />
            )
          })}
        </tr>
      </thead>
    )
  }

})
