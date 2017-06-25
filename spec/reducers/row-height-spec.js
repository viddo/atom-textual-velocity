/* @flow */

import * as A from "../../lib/action-creators";
import rowHeightReducer from "../../lib/reducers/row-height";

describe("reducers/row-height", () => {
  let state;

  beforeEach(function() {
    state = rowHeightReducer(undefined, A.initialScanDone());
  });

  it("should return default", function() {
    expect(state).toEqual(jasmine.any(Number));
  });

  it("should return state unless defaults are missing", function() {
    const prevState = state;
    state = rowHeightReducer(state, A.initialScanDone());
    expect(state).toBe(prevState);
  });

  describe("when change row height", function() {
    beforeEach(function() {
      state = rowHeightReducer(state, A.changeRowHeight(20));
    });

    it("should only update row height", function() {
      expect(state).toEqual(20);
    });
  });

  describe("when other random action", function() {
    it("should update list height", function() {
      const prevState = state;
      state = rowHeightReducer(state, A.initialScanDone());
      expect(state).toBe(prevState);
    });
  });
});
