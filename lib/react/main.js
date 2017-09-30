/* @flow */

import classNames from "classnames";
import React from "react";
import ReactDOM from "react-dom";
import { Observable } from "rxjs";
import Cell from "./cell";
import EditCellStr from "./edit-cell-str";
import LoadingProgress from "./loading-progress";
import ResizeHandle from "./resize-handle";
import ScrollableList from "./scrollable-list";
import Search from "./search";
import TableColumn from "./table-column";

const privates = new WeakMap();

export default class Main extends React.Component<MainProps> {
  render() {
    const { actions } = this.props;

    if (!this.props.initialScanDone) {
      return (
        <div className="textual-velocity">
          <div className="tv-loading-progress">
            <span className="inline-block text-smaller text-subtle">
              Scanning path… {this.props.initialScanFilesCount} files found
            </span>
            <progress className="inline-block" value={0} />
          </div>
        </div>
      );
    }

    const { paginationStart, sortDirection, sortField } = this.props;

    return (
      <div className="textual-velocity">
        <Search
          query={this.props.queryOriginal}
          focusOnEvents={!this.props.editCellName}
          onSearch={actions.search}
          onKeyPress={actions.keyPress}
        />
        <LoadingProgress
          readyCount={this.props.readyCount}
          totalCount={this.props.totalCount}
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
                                  )}
                                abort={() => actions.editCellAbort()}
                              />
                            );

                          case "read":
                          default:
                            return (
                              <Cell
                                key={i}
                                cell={cell}
                                onDoubleClick={() => {
                                  if (cell.editCellName) {
                                    actions.editCell(cell.editCellName);
                                  }
                                }}
                              />
                            );
                        }
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollableList>
          <ResizeHandle
            listHeight={this.props.listHeight}
            onResize={actions.resizeList}
          />
        </div>
      </div>
    );
  }

  componentDidMount() {
    const changeRowHeightSubscription = Observable.fromEvent(window, "resize")
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

    privates.set(this, changeRowHeightSubscription);
  }

  componentWillUnmount() {
    const changeRowHeightSubscription = privates.get(this);
    if (changeRowHeightSubscription) {
      changeRowHeightSubscription.unsubscribe();
    }

    privates.delete(this);
  }
}
