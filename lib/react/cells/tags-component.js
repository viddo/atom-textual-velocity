'use babel'

import {React} from 'react-for-atom'

// Item to render a summary
export default React.createClass({

  propTypes: {
    tags: React.PropTypes.array
  },

  render () {
    return (
      <td>
        {this.props.tags.map(tag => {
          return (
            <span key={tag} className='inline-block highlight'>{tag}</span>
          )
        })}
      </td>
    )
  }

})
