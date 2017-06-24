/* @flow */

import * as A from "../../lib/action-creators";
import listHeightReducer from "../../lib/reducers/list-height";

describe("reducers/list-height", () => {
  let state;

  beforeEach(function() {
    state = listHeightReducer(undefined, A.initialScanDone());
  });

  it("should have a default height", function() {
    expect(state).toEqual(jasmine.any(Number));
  });

  it("should return state unless defaults are missing", function() {
    const prevState = state;
    state = listHeightReducer(state, A.initialScanDone());
    expect(state).toBe(prevState);
  });

  describe("when resized list", function() {
    beforeEach(function() {
      state = listHeightReducer(state, A.resizeList(123));
    });

    it("should only update list height", function() {
      expect(state).toEqual(123);
    });
  });

  describe("when changed list height", function() {
    beforeEach(function() {
      state = listHeightReducer(state, A.changeListHeight(123));
    });

    it("should only update list height", function() {
      expect(state).toEqual(123);
    });
  });

  describe("when other random action", function() {
    it("should update list height", function() {
      const prevState = state;
      state = listHeightReducer(state, A.initialScanDone());
      expect(state).toBe(prevState);
    });
  });
});
