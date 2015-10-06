'use babel';

import React from 'react-for-atom';
import Th from './th';

export default React.createClass({

  propTypes: {
    width: React.PropTypes.number,
    title: React.PropTypes.string,
  },

  render() {
    return (
      <th style={{width: this.props.width}}>
        {this.props.title}
      </th>
    );
  },

});
