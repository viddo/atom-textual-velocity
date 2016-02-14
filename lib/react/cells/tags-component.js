'use babel'

import {React} from 'react-for-atom'
import EditComponent from './edit-component.js'

// Component to render and edit tags, stored in OSX metadata
export default React.createClass({

  propTypes: {
    tags: React.PropTypes.string,
    isSelected: React.PropTypes.bool,
    saveTags: React.PropTypes.func
  },

  getInitialState () {
    return { isEditing: false }
  },

  render () {
    if (this.state.isEditing) {
      return (
        <td className='tv-td--tags'>
          <EditComponent initialVal={this.props.tags} save={this._save} abort={this._abort} />
        </td>
      )
    } else {
      return (
        <td onClick={this._onClick}>
          {this.props.tags.split(' ').map(tag => <span key={tag} className='inline-block highlight'>{tag}</span>)}
        </td>
      )
    }
  },

  _onClick () {
    if (this.props.isSelected) {
      this.setState({ isEditing: true })
    }
  },

  _save (tags) {
    this.props.saveTags(tags)
    this.setState({ isEditing: false })
  },

  _abort () {
    this.setState({ isEditing: false })
  }

})
