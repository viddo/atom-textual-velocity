/* @flow */

import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import { Observable } from "rxjs";
import Cell from "./cell";
import EditCellStr from "./edit-cell-str";
import Loading from "./loading";
import ResizeHandle from "./resize-handle-container";
import ScrollableList from "./scrollable-list";
import Search from "./search";
import TableColumn from "./table-column";

type Props = {
  actions: {
    changeRowHeight: Function,
    changeSortDirection: Function,
    changeSortField: Function,
    clickRow: Function,
    editCell: Function,
    editCellAbort: Function,
    editCellSave: Function,
    keyPress: Function,
    scroll: Function,
    search: Function
  },
  columnHeaders: Array<ColumnHeader>,
  editCellName: EditCellName,
  itemsCount: number,
  listHeight: number,
  loading: LoadingState,
  paginationStart: number,
  queryOriginal: string,
  rowHeight: number,
  scrollTop: number,
  sortDirection: SortDirection,
  sortField: string,
  visibleRows: Array<Row>
};

export default class Main extends React.Component<Props> {
  _changeRowHeightSubscription: rxjs$Subscription | void | null;

  render() {
    if (this.props.loading.status !== "done") {
      return <Loading loading={this.props.loading} />;
    }

    const { actions, paginationStart, sortDirection, sortField } = this.props;

    return (
      <div className="textual-velocity">
        <Search
          query={this.props.queryOriginal}
          focusOnEvents={!this.props.editCellName}
          onSearch={actions.search}
          onKeyPress={actions.keyPress}
        />
        <div className="tv-items">
          <div className="header">
            <table>
              <thead>
                <tr>
                  {this.props.columnHeaders.map(column => {
                    return (
                      <TableColumn
                        key={column.title}
                        column={column}
                        sortDirection={sortDirection}
                        isSelected={column.sortField === sortField}
                        onSortByField={actions.changeSortField}
                        onChangeSortDirection={actions.changeSortDirection}
                      />
                    );
                  })}
                </tr>
              </thead>
            </table>
          </div>
          <ScrollableList
            listHeight={this.props.listHeight}
            rowHeight={this.props.rowHeight}
            itemsCount={this.props.itemsCount}
            paginationStart={paginationStart}
            scrollTop={this.props.scrollTop}
            onScroll={actions.scroll}
          >
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
                        actions.clickRow(filename);
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
                                save={str =>
                                  actions.editCellSave(
                                    this.props.editCellName,
                                    str
                                  )
                                }
                                abort={() => actions.editCellAbort()}
                              />
                            );

                          case "read":
                          default:
                            return (
                              <td
                                className={cell.className}
                                key={i}
                                onDoubleClick={() => {
                                  if (cell.editCellName) {
                                    actions.editCell(cell.editCellName);
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
    this._changeRowHeightSubscription = Observable.fromEvent(window, "resize")
      .debounceTime(50)
      .subscribe(() => {
        const el = ReactDOM.findDOMNode(this);
        if (el && el instanceof HTMLElement) {
          const td = el.querySelector("td");
          if (td && td.clientHeight > 0) {
            this.props.actions.changeRowHeight(td.clientHeight);
          }
        }
      });
  }

  componentWillUnmount() {
    if (this._changeRowHeightSubscription) {
      this._changeRowHeightSubscription.unsubscribe();
    }
    this._changeRowHeightSubscription = null;
  }
}
