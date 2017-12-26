/* @flow */

import * as React from "react";

type Props = {
  loading: LoadingState,
  onClickInfo: () => any
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
      case "readDir":
        return (
          <div className="block">
            <div className="inline-block text-smaller text-subtle">
              Reading path for files… hold on, might take a moment or two
            </div>
          </div>
        );

      case "readingFiles":
        return (
          <div className="block">
            <div className="padded text-smaller text-subtle">
              Read path, found {this.props.loading.totalCount} files
            </div>
            <div className="padded tv-load-progress">
              <span className="inline-block text-smaller text-subtle">
                Reading files… {this.props.loading.readyCount} of{" "}
                {this.props.loading.totalCount} done
              </span>
              <span
                className="icon icon-info tv-info"
                onClick={this.props.onClickInfo}
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
}
