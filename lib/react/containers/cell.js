/* @flow */

import { connect } from "react-redux";
import * as React from "react";
import type { Dispatch } from "redux";
import type { MapDispatchToProps } from "react-redux";
import * as A from "../../action-creators";
import CellEditor from "../presentationals/cell-editor";
import Cell from "../presentationals/cell";

type Props = {
  cell: RowCell,
  onAbort: () => any,
  onDoubleClick: (cell: RowCell) => any,
  onSave: (value: string) => any
};

class CellContainer extends React.Component<Props> {
  render() {
    switch (this.props.cell.type) {
      case "edit":
        return (
          <CellEditor
            initialVal={this.props.cell.editCellStr}
            onSave={this.props.onSave}
            onAbort={this.props.onAbort}
          />
        );

      case "read":
      default:
        return (
          <Cell
            cell={this.props.cell}
            onDoubleClick={this.props.onDoubleClick}
          />
        );
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
  dispatch: Dispatch<Action>
) => {
  return {
    onDoubleClick: cell => {
      if (typeof cell.editCellName === "string") {
        dispatch(A.editCell(cell.editCellName));
      }
    },
    onSave: value => {
      dispatch(A.editCellSave(value));
    },
    onAbort: () => {
      dispatch(A.editCellAbort());
    }
  };
};

export default connect(null, mapDispatchToProps)(CellContainer);
