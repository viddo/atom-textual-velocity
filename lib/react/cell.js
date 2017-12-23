/* @flow */

import React from "react";

type Props = {
  content: CellContent
};

export default class Cell extends React.Component<Props> {
  render() {
    return renderContent(this.props.content);
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
