'use babel'

import {React} from 'react-for-atom'

export default React.createClass({

  propTypes: {
    name: React.PropTypes.string,
    ext: React.PropTypes.string,
    regexp: React.PropTypes.object
  },

  render () {
    const name = this.props.name
    const ext = this.props.ext
      ? this.props.ext
      : ''

    const m = this.props.regexp && this.props.regexp.exec(name)
    if (m) {
      return (
        <span>
          {name.slice(0, m.index)}
          <span className='text-highlight'>{m[0]}</span>
          {name.slice(m.index + m[0].length)}
          <span className='text-subtle'>{ext}</span>
        </span>
      )
    } else {
      return (
        <span>
          {name}
          <span className='text-subtle'>{ext}</span>
        </span>
      )
    }
  }
})
