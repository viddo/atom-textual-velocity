/* @flow */

import * as React from "react";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";
import * as A from "../../action-creators";
import paginationSelector from "../../reselectors/pagination";
import newVisibleRowsSelector from "../../reselectors/visible-rows";
import Header from "../presentationals/header";
import Loading from "../presentationals/loading";
import Panel from "../presentationals/panel";
import Rows from "../presentationals/rows";
import Cell from "../containers/cell";
import Row from "../containers/row";
import ResizeHandle from "../containers/resize-handle";
import ScrollableList from "../containers/scrollable-list";
import Search from "../containers/search";
import TableColumn from "../containers/table-column";

class AppContainer extends React.Component<*> {
  render() {
    if (this.props.loading.status !== "done") {
      return (
        <Loading
          loading={this.props.loading}
          onClickInfo={this.props.onLoadingInfoClick}
        />
      );
    }

    const { columnHeaders, paginationStart } = this.props;

    return (
      <Panel onResize={this.props.onResize}>
        <Search />
        <Header>
          {columnHeaders.map(column => (
            <TableColumn key={column.title} column={column} />
          ))}
        </Header>
        <ScrollableList paginationStart={paginationStart}>
          <Rows columnHeaders={columnHeaders} paginationStart={paginationStart}>
            {this.props.visibleRows.map(row => (
              <Row key={row.id} row={row}>
                {row.cells.map((cell, i) => <Cell key={i} cell={cell} />)}
              </Row>
            ))}
          </Rows>
        </ScrollableList>
        <ResizeHandle />
      </Panel>
    );
  }
}

export default function newApp(columns: Columns) {
  const visibleRowsSelector = newVisibleRowsSelector(
    columns,
    paginationSelector
  );

  const mapStateToProps: MapStateToProps<State, *, *> = (state: State) => {
    return {
      columnHeaders: state.columnHeaders,
      loading: state.loading,
      paginationStart: paginationSelector(state).start,
      visibleRows: visibleRowsSelector(state)
    };
  };

  const mapDispatchToProps: MapDispatchToProps<Action, *, *> = (
    dispatch: Dispatch<Action>
  ) => {
    return {
      onLoadingInfoClick: () => {
        atom.notifications.addInfo("Textual Velocity", {
          description:
            "Reading files to populate searchable note fields. It's only necessary for the first time, after that it's cached.",
          dismissable: true
        });
      },
      onResize: clientHeight => {
        dispatch(A.changeRowHeight(clientHeight));
      }
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(AppContainer);
}
