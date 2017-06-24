/* @flow */

import * as A from "../../lib/action-creators";
import initialScanReducer from "../../lib/reducers/initial-scan";

describe("reducers/initial-scan", () => {
  let state: InitialScan;

  beforeEach(function() {
    state = initialScanReducer(undefined, A.startInitialScan());
  });

  describe("when file-added action", function() {
    beforeEach(function() {
      state = initialScanReducer(
        state,
        A.fileAdded({
          filename: "a",
          stats: { mtime: new Date() }
        })
      );
      state = initialScanReducer(
        state,
        A.fileAdded({
          filename: "b",
          stats: { mtime: new Date() }
        })
      );
    });

    it("should append new files", function() {
      expect(state.rawFiles.length).toEqual(2);
      expect(state.rawFiles[0].filename).toEqual("a");
    });

    it("should not be done yet", function() {
      expect(state.done).toBe(false);
    });
  });

  describe("when initial-scan-done action", function() {
    let prevState;

    beforeEach(function() {
      prevState = state;
      state = initialScanReducer(state, A.initialScanDone());
    });

    it("should set done flag to true", function() {
      expect(state.done).toBe(true);
    });

    it("should still have raw files", function() {
      expect(state.rawFiles).toBe(prevState.rawFiles);
    });

    describe("when initial scan raw files are read ", function() {
      beforeEach(function() {
        state = initialScanReducer(state, A.initialScanRawFilesRead());
        expect(state.done).toBe(true);
      });

      it("should no longer have any raw files", function() {
        expect(state.rawFiles).toEqual([]);
      });
    });
  });
});
