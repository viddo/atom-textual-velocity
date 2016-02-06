'use babel'

import { React } from 'react-for-atom'
import fs from 'fs-plus'

export default React.createClass({
  propTypes: {
    path: React.PropTypes.string,
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
        <span className={this._iconClassForBasename()} data-name={this.props.name + this.props.ext} data-path={this.props.path}>
          {name.slice(0, m.index)}
          <span className='text-highlight'>{m[0]}</span>
          {name.slice(m.index + m[0].length)}
          <span className='text-subtle'>{ext}</span>
        </span>
      )
    } else {
      return (
        <span className={this._iconClassForBasename()} data-name={this.props.name + this.props.ext} data-path={this.props.path}>
          {name}<span className='text-subtle'>{ext}</span>
        </span>
      )
    }
  },

  _iconClassForBasename () {
    // from https://github.com/atom/tree-view/blob/9dcc89fc0c8505528f393b5ebdd93616a8adbd68/lib/default-file-icons.coffee
    if (fs.isSymbolicLinkSync(this.props.path)) {
      return 'icon icon-file-symlink-file'
    } else if (fs.isReadmePath(this.props.path)) {
      return 'icon icon-book'
    }

    const ext = this.props.ext
    if (fs.isCompressedExtension(ext)) {
      return 'icon icon-file-zip'
    } else if (fs.isImageExtension(ext)) {
      return 'icon icon-file-media'
    } else if (fs.isPdfExtension(ext)) {
      return 'icon icon-file-pdf'
    } else if (fs.isBinaryExtension(ext)) {
      return 'icon icon-file-binary'
    } else {
      return 'icon icon-file-text'
    }
  }
})
