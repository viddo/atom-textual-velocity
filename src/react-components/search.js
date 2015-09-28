'use babel';

import React from 'react-for-atom';
import BaconMixin from './baconjs-mixin';

export default React.createClass({

  mixins: [BaconMixin],

  propTypes: {
    showStream: React.PropTypes.object,
    searchStream: React.PropTypes.object,
    changeBus: React.PropTypes.object,
    keyDownBus: React.PropTypes.object,
  },

  getInitialState() {
    return {
      searchStr: '',
    };
  },

  componentWillMount() {
    // delay to render UI before select-and-focus
    this.onStreamsValues(this.props.showStream.delay(1), this._selectAndFocus);
    this.onStreamsValues(this.props.searchStream, str =>
      this.setState({
        searchStr: str,
      })
    );
  },

  render() {
    return (
      <input ref='theInput' type='text' className='atom-notational-search native-key-bindings'
        value={this.state.searchStr}
        onChange={this._onChange}
        placeholder='Search, or press enter to create a new untitled file' />
    );
  },

  componentDidMount() {
    // An evil necessary, due to https://github.com/atom/atom/blob/8eaaf40a2cffd9e091a420ca0634c9da9cf4b544/src/window-event-handler.coffee#L77
    // that prevents keydown events to propagate to React's event handler
    this._input().addEventListener('keydown', this._onKeyDown);
    this._selectAndFocus();
  },

  componentWillUnmount() {
    this._input().removeEventListener('keydown', this._onKeyDown);
  },

  _onKeyDown(ev) {
    this.props.keyDownBus.push(ev);
  },

  _onChange(ev) {
    this.props.changeBus.push(ev);
  },

  _input() {
    return React.findDOMNode(this.refs.theInput);
  },

  _selectAndFocus() {
    let input = this._input();
    input.select();
    input.focus();
  },

});
