'use babel'

import {React} from 'react-for-atom'
import bplist from 'bplist'
import xattr from 'fs-xattr'
import EditComponent from './edit-component.js'

// Component to render and edit tags, stored in OSX metadata
export default React.createClass({

  propTypes: {
    file: React.PropTypes.object,
    isSelected: React.PropTypes.bool
  },

  getInitialState () {
    return { isEditing: false }
  },

  render () {
    if (this.state.isEditing) {
      return (
        <td className='tv-td--tags'>
          <EditComponent initialVal={this.props.file.tags} save={this._save} abort={this._abort} />
        </td>
      )
    } else {
      var tags = this.props.file.tags.split(' ')
      return (
        <td onClick={this._onClick}>
          {tags.map(tag => <span key={tag} className='inline-block highlight'>{tag}</span>)}
        </td>
      )
    }
  },

  _onClick (ev) {
    if (this.props.isSelected) {
      ev.stopPropagation()
      this.setState({ isEditing: true })
    }
  },

  _save (tags) {
    // TODO move this to project, only available for darwin platform
    var plistBuf = bplist.create([tags.split(' ')])
    try {
      xattr.setSync(this.props.file.path, 'com.apple.metadata:kMDItemOMUserTags', plistBuf)
      this.setState({ isEditing: false })
    } catch (err) {
      atom.notifications.addWarning('Could not save tags', {
        detail: err.toString(),
        dismissable: true
      })
    }
  },

  _abort () {
    this.setState({ isEditing: false })
  }

})
