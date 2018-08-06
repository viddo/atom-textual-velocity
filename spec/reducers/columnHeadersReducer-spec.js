/* @flow */

import * as A from "../../lib/actions";
import columnHeadersReducer from "../../lib/reducers/columnHeadersReducer";

xdescribe("reducers/columnHeadersReducer", () => {
  let state;

  it("should return defaults when state is missing", function() {
    state = columnHeadersReducer(state, A.readDirDone([]));
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
