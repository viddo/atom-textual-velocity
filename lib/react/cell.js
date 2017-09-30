/* @flow */

import React from "react";

type Props = {
  cell: ReadRowCell,
  onDoubleClick: Function
};

export default class Cell extends React.Component<Props> {
  render() {
    return (
      <td
        className={this.props.cell.className}
        onDoubleClick={this.props.onDoubleClick}
      >
        {this._renderContent(this.props.cell.content)}
      </td>
    );
  }

  _renderContent(content: CellContent, i?: number) {
    if (typeof content === "string") {
      return content;
    } else if (content instanceof Array) {
      return content.map((item, i) => this._renderContent(item, i + 1));
    } else if (typeof content === "object") {
      const attrs = content.attrs || {};
      return (
        <span key={i} {...attrs}>
          {content.content ? this._renderContent(content.content) : ""}
        </span>
      );
    } else {
      return "";
    }
  }
}
