'use babel'

import {React} from 'react-for-atom'

export default React.createClass({

  render () {
    return (
      <div className='tv-loader' style={{ display: 'block' }}>
        <ul className='background-message'>
          <li>
            <div className='padded'>
              <span className='loading loading-spinner-small inline-block'></span>
              <span className='inline-block padded'>Loading</span>
            </div>
          </li>
        </ul>
      </div>
    )
  }
})
