'use babel'

import {React} from 'react-for-atom'

export default React.createClass({

  propTypes: {
    className: React.PropTypes.string,
    content: React.PropTypes.any,
    onClick: React.PropTypes.func
  },

  render () {
    return <td className={this.props.className} onClick={() => this.props.onClick()}>
      {this._renderContent(this.props.content)}
    </td>
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
