/* @flow */

import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import { Observable } from "rxjs";
import Cell from "./cell";
import EditCellStr from "./edit-cell-str";
import Loading from "./loading";
import ResizeHandle from "./resize-handle-container";
import ScrollableList from "./scrollable-list-container";
import Search from "./search-container";
import TableColumn from "./table-column-container";

type Props = {
  columnHeaders: Array<ColumnHeader>,
  loading: LoadingState,
  onResize: (clientHeight: number) => any,
  onClickRow: (filename: string) => any,
  onEditCell: (editCellName: string) => any,
  onEditCellAbort: () => any,
  onEditCellSave: (value: string) => any,
  paginationStart: number,
  visibleRows: Array<Row>
};

export default class Main extends React.Component<Props> {
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
                {this.props.visibleRows.map(row => {
                  const { filename } = row;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        this.props.onClickRow(filename);
                      }}
                      className={classNames({ "is-selected": row.selected })}
                    >
                      {row.cells.map((cell, i) => {
                        switch (cell.type) {
                          case "edit":
                            return (
                              <EditCellStr
                                key={i}
                                initialVal={cell.editCellStr}
                                save={value => {
                                  this.props.onEditCellSave(value);
                                }}
                                abort={() => this.props.onEditCellAbort()}
                              />
                            );

                          case "read":
                          default:
                            return (
                              <td
                                className={cell.className}
                                key={i}
                                onDoubleClick={() => {
                                  if (typeof cell.editCellName === "string") {
                                    this.props.onEditCell(cell.editCellName);
                                  }
                                }}
                              >
                                <Cell content={cell.content} />
                              </td>
                            );
                        }
                      })}
                    </tr>
                  );
                })}
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
