/* @flow */

import * as A from "../../lib/action-creators";
import Columns from "../../lib/columns";
import FileIconColumn from "../../lib/columns/file-icon-column";
import SummaryColumn from "../../lib/columns/summary-column";
import makeColumnHeadersReducer from "../../lib/reducers/column-headers";

describe("reducers/column-headers", () => {
  let state;
  let columnHeadersReducer;

  beforeEach(function() {
    const columns = new Columns();
    columns.add(new SummaryColumn({ sortField: "name", editCellName: "" }));
    columns.add(new FileIconColumn({ sortField: "ext" }));

    columnHeadersReducer = makeColumnHeadersReducer(columns);
  });

  it("should return defaults when state is missing", function() {
    state = columnHeadersReducer(state, A.initialScanDone());
    expect(state).toEqual(jasmine.any(Array));
    expect(state.length).toEqual(2);

    expect(state[0].sortField).toEqual(jasmine.any(String));
    expect(state[0].title).toEqual(jasmine.any(String));
    expect(state[0].width).toEqual(jasmine.any(Number));
  });

  it("should exclude hidden columns", function() {
    state = columnHeadersReducer(state, A.changeHiddenColumns(["summary"]));
    expect(state).toEqual(jasmine.any(Array));
    expect(state.length).toEqual(1);

    state = columnHeadersReducer(
      state,
      A.changeHiddenColumns(["summary", "file-type"])
    );
    expect(state).toEqual([]);
  });
});
