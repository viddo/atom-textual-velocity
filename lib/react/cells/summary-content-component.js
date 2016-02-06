'use babel'

import {React} from 'react-for-atom'

const HIGHLIGHT_CONTENT_PADDING = 20 // characters
const MAX_PREVIEW_LENGTH = 400 // characters
const MIN_REGEXP_MATCH_LENGTH = 2 // characters

// Item to render a summary
export default React.createClass({

  propTypes: {
    content: React.PropTypes.string,
    regexp: React.PropTypes.object,
    searchStr: React.PropTypes.string
  },

  render () {
    const content = this.props.content
    if (content.length === 0) {
      return <span />
    }

    const m = this.props.regexp && this.props.regexp.exec(this.props.content)
    if (!m || this.props.searchStr.length < MIN_REGEXP_MATCH_LENGTH) {
      return (
        <span className='text-subtle'> - {content.slice(0, MAX_PREVIEW_LENGTH)}</span>
      )
    }

    const start = Math.max(m.index - HIGHLIGHT_CONTENT_PADDING, 0) // make sure start doesn't go below 0
    const highlightEnd = m.index + m[0].length
    return (
      <span className='text-subtle'> - {start > 0 ? '…' : ''}
        {content.slice(start, m.index)}
        <span className='text-highlight'>{m[0]}</span>
        {content.slice(highlightEnd, highlightEnd + MAX_PREVIEW_LENGTH - (highlightEnd - start))}
      </span>
    )
  }
})
