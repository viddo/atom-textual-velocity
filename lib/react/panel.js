/* @flow */

import React from "react";
import ReactDOM from "react-dom";
import { Observable } from "rxjs";
import Loading from "./presentationals/loading";
import Header from "./presentationals/header";
import Rows from "./presentationals/rows";
import Cell from "./containers/cell";
import Row from "./containers/row";
import ResizeHandle from "./containers/resize-handle";
import ScrollableList from "./containers/scrollable-list";
import Search from "./containers/search";
import TableColumn from "./containers/table-column";

type Props = {
  columnHeaders: ColumnHeader[],
  loading: LoadingState,
  onResize: (clientHeight: number) => any,
  paginationStart: number,
  visibleRows: NoteRow[]
};

export default class Panel extends React.Component<Props> {
  _resizeSubscription: rxjs$Subscription | void | null;

  render() {
    if (this.props.loading.status !== "done") {
      return <Loading loading={this.props.loading} />;
    }

    const { columnHeaders, paginationStart } = this.props;

    return (
      <div className="textual-velocity">
        <Search />
        <div className="tv-items">
          <Header>
            {columnHeaders.map(column => (
              <TableColumn key={column.title} column={column} />
            ))}
          </Header>
          <ScrollableList paginationStart={paginationStart}>
            <Rows
              columnHeaders={columnHeaders}
              paginationStart={paginationStart}
            >
              {this.props.visibleRows.map(row => (
                <Row key={row.id} row={row}>
                  {row.cells.map((cell, i) => <Cell key={i} cell={cell} />)}
                </Row>
              ))}
            </Rows>
          </ScrollableList>
          <ResizeHandle />
        </div>
      </div>
    );
  }

  componentDidMount() {
    this._resizeSubscription = Observable.fromEvent(window, "resize")
      .debounceTime(50)
      .subscribe(() => {
        const el = ReactDOM.findDOMNode(this);
        if (el && el instanceof HTMLElement) {
          const td = el.querySelector("td");
          if (td && td.clientHeight > 0) {
            this.props.onResize(td.clientHeight);
          }
        }
      });
  }

  componentWillUnmount() {
    if (this._resizeSubscription) {
      this._resizeSubscription.unsubscribe();
    }
    this._resizeSubscription = null;
  }
}
