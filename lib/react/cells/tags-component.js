'use babel'

import {React} from 'react-for-atom'

// Item to render a summary
export default React.createClass({

  propTypes: {
    tags: React.PropTypes.string
  },

  render () {
    var tags = this.props.tags.split(' ')
    return (
      <td>
        {tags.map(tag => {
          return (
            <span key={tag} className='inline-block highlight'>{tag}</span>
          )
        })}
      </td>
    )
  }

})
