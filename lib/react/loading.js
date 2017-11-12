/* @flow */

import React from "react";

type Props = {
  loading: LoadingState
};

export default class Loading extends React.Component<Props> {
  render() {
    return (
      <div className="textual-velocity">
        <div className="tv-loading-progress">{this._renderInline()}</div>
      </div>
    );
  }

  _renderInline() {
    switch (this.props.loading.status) {
      case "initialScan":
        return (
          <div className="block">
            <div className="inline-block text-smaller text-subtle">
              Scanning path, {this.props.loading.filesCount} files found…
            </div>
          </div>
        );

      case "readingFiles":
        return (
          <div className="block">
            <div className="inline-block text-smaller text-subtle">
              Scanned path, {this.props.loading.totalCount} files found!
            </div>
            <div className="tv-load-progress">
              <span className="inline-block text-smaller text-subtle">
                Reading {this.props.loading.readyCount} of{" "}
                {this.props.loading.totalCount} files
              </span>
              <span
                className="icon icon-info tv-info"
                onClick={this._onClick}
              />
              <progress
                className="inline-block"
                max={this.props.loading.totalCount}
                value={this.props.loading.readyCount}
              />
            </div>
          </div>
        );

      default:
        return <span />;
    }
  }

  _onClick() {
    atom.notifications.addInfo("Textual Velocity", {
      description:
        "Reading files to populate searchable note fields. It's only necessary for the first run of your notes path, after that it gets cached (until you change notes path or clear the cache).",
      dismissable: true
    });
  }
}
