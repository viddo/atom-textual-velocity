'use babel'

import {React} from 'react-for-atom'
import R from 'ramda'
import SummaryTitle from './summary-title'
import SummaryContent from './summary-content'

export default React.createClass({

  propTypes: {
    file: React.PropTypes.object,
    searchStr: React.PropTypes.string,
    tokens: React.PropTypes.array
  },

  render () {
    const regexp = R.path(['regex'], R.head(this.props.tokens || []))
    return (
      <td>
        <SummaryTitle path={this.props.file.path} name={this.props.file.name} ext={this.props.file.ext} regexp={regexp} />
        <SummaryContent content={this.props.file.content} searchStr={this.props.searchStr} regexp={regexp} />
      </td>
    )
  }
})
