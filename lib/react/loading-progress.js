/* @flow */

import React from "react";

type Props = {
  readyCount: number,
  totalCount: number
};

export default class LoadingProgress extends React.Component<Props> {
  render() {
    if (
      this.props.totalCount === 0 ||
      this.props.readyCount === 0 ||
      this.props.readyCount === this.props.totalCount
    ) {
      return <span />;
    }

    return (
      <div className="tv-loading-progress">
        <span className="inline-block text-smaller text-subtle">
          Reading {this.props.readyCount} of {this.props.totalCount} files
        </span>
        <span className="icon icon-info tv-info" onClick={this._onClick} />
        <progress
          className="inline-block"
          max={this.props.totalCount}
          value={this.props.readyCount}
        />
      </div>
    );
  }

  _onClick() {
    atom.notifications.addInfo("Textual Velocity", {
      description:
        "Reading files to populate searchable note fields. It's only necessary for the first run of your notes path, after that it gets cached (until you change notes path or clear the cache).",
      dismissable: true
    });
  }
}
