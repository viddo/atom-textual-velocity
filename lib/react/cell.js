/* @flow */

import {React} from 'react-for-atom'

export default class Cell extends React.Component {

  props: {
    cell: Cell,
    onClick: Function
  }

  render () {
    return <td className={this.props.cell.className} onClick={this.props.onClick}>
      {this._renderContent(this.props.cell.content)}
    </td>
  }

  _renderContent (content: CellContentType, i?: number) {
    if (typeof content === 'string') {
      return content
    } else if (content instanceof Array) {
      return this._renderArray(content)
    } else if (typeof content === 'object') {
      return this._renderObject(content, i || 0)
    } else {
      return ''
    }
  }

  _renderArray (contents: Array<CellContentType>) {
    return contents.map((item, i) => this._renderContent(item, i + 1))
  }

  _renderObject (obj: Object, i: number) {
    const attrs = obj.attrs || {}
    return (
      <span key={i} {...attrs}>
        {this._renderContent(obj.content)}
      </span>)
  }

}
