/* @flow */

import * as React from "react";

type Props = {
  children?: React.Node
};

export default class Header extends React.Component<Props> {
  render() {
    return (
      <div className="header">
        <table>
          <thead>
            <tr>{this.props.children}</tr>
          </thead>
        </table>
      </div>
    );
  }
}
