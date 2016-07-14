'use babel'

import {React} from 'react-for-atom'

export default React.createClass({

  propTypes: {
    content: React.PropTypes.any
  },

  render () {
    return <td>{this._renderContent(this.props.content)}</td>
  },

  _renderContent (content, i) {
    if (typeof content === 'string') {
      return content
    } else if (content instanceof Array) {
      return this._renderArray(content)
    } else if (typeof content === 'object') {
      return this._renderObject(content, i)
    } else {
      return ''
    }
  },

  _renderArray (array) {
    return array.map((item, i) => this._renderContent(item, i))
  },

  _renderObject (obj, i) {
    const attrs = obj.attrs || {}
    return (
      <span key={i} {...attrs}>
        {this._renderContent(obj.content)}
      </span>)
  }

})
