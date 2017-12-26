/* @flow */

import React from "react";
import CellEditor from "./cell-editor";

type Props = {
  cell: RowCell,
  onAbort: () => any,
  onSave: (value: string) => any,
  onDoubleClick: (cell: ReadRowCell) => any
};

type State = {
  value: string
};

export default class Cell extends React.Component<Props, State> {
  render() {
    const { cell } = this.props;
    switch (cell.type) {
      case "edit":
        return (
          <CellEditor
            initialVal={cell.editCellStr}
            onSave={this.props.onSave}
            onAbort={this.props.onAbort}
          />
        );

      case "read":
      default:
        return (
          <td
            className={cell.className}
            onDoubleClick={() => {
              this.props.onDoubleClick(cell);
            }}
          >
            {renderContent(cell.content)}
          </td>
        );
    }
  }
}

function renderContent(content: CellContent, i?: number) {
  if (typeof content === "string") {
    return content;
  } else if (content instanceof Array) {
    return content.map(renderContent);
  } else if (typeof content === "object") {
    const attrs = content.attrs || {};
    return (
      <span key={i} {...attrs}>
        {content.content ? renderContent(content.content) : ""}
      </span>
    );
  } else {
    return "";
  }
}
