/* @flow */

import * as React from "react";
import { connect } from "react-redux";
import type { Dispatch } from "redux";
import type { MapDispatchToProps, MapStateToProps } from "react-redux";
import * as A from "../../actions";
import paginationSelector from "../../reselectors/paginationSelector";
import visibleRowsSelector from "../../reselectors/visibleRowsSelector";
import Header from "../presentationals/Header";
import Loading from "../presentationals/Loading";
import Panel from "../presentationals/Panel";
import Rows from "../presentationals/Rows";
import Cell from "./Cell";
import ResizeHandle from "./ResizeHandle";
import Row from "./Row";
import ScrollableList from "./ScrollableList";
import Search from "./Search";
import TableColumn from "./TableColumn";
import type { Action } from "../../actions";
import type { State } from "../../flow-types/State";

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
                {row.cells.map((cell, i) => {
                  // $FlowFixMe complaints about onDoubleClick, which is there :/
                  return <Cell key={i} cell={cell} />;
                })}
              </Row>
            ))}
          </Rows>
        </ScrollableList>
        <ResizeHandle />
      </Panel>
    );
  }
}

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

const App = connect(mapStateToProps, mapDispatchToProps)(AppContainer);

export default App;
