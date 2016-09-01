'use babel'

import {React} from 'react-for-atom'

export default React.createClass({

  propTypes: {
    filenames: React.PropTypes.array
  },

  render () {
    return (
      <atom-panel className='top'>
        <div className='padded'>
          <ul className='list-group'>
            {this.props.filenames.map(filename => {
              return <li key={filename}>{filename}</li>
            })}
          </ul>
        </div>
      </atom-panel>
    )
  }
})
