'use babel'

import Path from 'path'
import React from 'react-for-atom'

const HIGHLIGHT_CONTENT_PADDING = 20 // characters
const MAX_CONTENT_LENGTH = 400 // characters

// Item to render a summary
export default React.createClass({

  propTypes: {
    item: React.PropTypes.object,
    results: React.PropTypes.object
  },

  getInitialState () {
    return {}
  },

  componentWillMount () {
    const regexp = this.props.results.regexp
    if (regexp) {
      this.setState({
        titleMatch: regexp.exec(this.props.item.path),
        contentMatch: regexp.exec(this.props.item.content)
      })
    }
  },

  render () {
    return (
      <td>
        {this._title()}
        {this._content()}
      </td>
    )
  },

  _title () {
    const path = this.props.item.path
    const basename = Path.basename(path)

    if (this.state.titleMatch) {
      const m = this.state.titleMatch
      const basenameIndex = path.indexOf(basename)
      return <span>
        <span className='text-subtle'>{path.slice(0, basenameIndex)}</span>
        {basename.slice(0, m.index - basenameIndex)}
        <span className='text-highlight'>{m[0]}</span>
        {path.slice(m.index + m[0].length)}
      </span>
    } else {
      const rootPath = path.replace(basename, '')
      return <span>
        <span className='text-subtle'>{rootPath}</span>
        {basename}
      </span>
    }
  },

  _content () {
    const content = this.props.item.content
    if (content.length === 0) {
      return ''
    }

    if (this.state.contentMatch && this.props.results.searchStr.length >= 3) {
      const m = this.state.contentMatch
      const start = Math.max(m.index - HIGHLIGHT_CONTENT_PADDING, 0) // make sure start doesn't go below 0
      const highlightEnd = m.index + m[0].length
      return <span className='text-subtle'> - {start > 0 ? '…' : ''}
        {content.slice(start, m.index)}
        <span className='text-highlight'>{m[0]}</span>
        {content.slice(highlightEnd, highlightEnd + MAX_CONTENT_LENGTH - (highlightEnd - start))}
      </span>
    } else {
      return <span className='text-subtle'> - {content.slice(0, MAX_CONTENT_LENGTH)}</span>
    }
  }

})
