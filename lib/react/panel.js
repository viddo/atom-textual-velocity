/* @flow */

import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import { Observable } from "rxjs";
import Cell from "./containers/cell";
import Loading from "./presentationals/loading";
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

    const { paginationStart } = this.props;

    return (
      <div className="textual-velocity">
        <Search />
        <div className="tv-items">
          <div className="header">
            <table>
              <thead>
                <tr>
                  {this.props.columnHeaders.map(column => (
                    <TableColumn key={column.title} column={column} />
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <ScrollableList paginationStart={paginationStart}>
            <table>
              <thead className="only-for-column-widths">
                <tr>
                  {this.props.columnHeaders.map(column => (
                    <th
                      key={column.title}
                      style={{ width: `${column.width}%` }}
                    />
                  ))}
                </tr>
              </thead>
              <tbody
                className={classNames({
                  "is-reversed-stripes": paginationStart % 2 === 1
                })}
              >
                {this.props.visibleRows.map(row => (
                  <Row key={row.id} row={row}>
                    {row.cells.map((cell, i) => <Cell key={i} cell={cell} />)}
                  </Row>
                ))}
              </tbody>
            </table>
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
