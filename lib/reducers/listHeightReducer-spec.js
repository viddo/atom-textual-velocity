/* @flow */

import * as A from "../actions";
import listHeightReducer from "./listHeightReducer";

describe("reducers/listHeightReducer", () => {
  let state;

  beforeEach(function() {
    state = listHeightReducer(undefined, A.readDirDone([]));
  });

  it("should have a default height", function() {
    expect(state).toEqual(jasmine.any(Number));
  });

  it("should return state unless defaults are missing", function() {
    const prevState = state;
    state = listHeightReducer(state, A.readDirDone([]));
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
      state = listHeightReducer(state, A.readDirDone([]));
      expect(state).toBe(prevState);
    });
  });
});
