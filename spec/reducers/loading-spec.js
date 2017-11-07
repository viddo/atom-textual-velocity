/* @flow */

import * as A from "../../lib/action-creators";
import loadingReducer from "../../lib/reducers/loading";

describe("reducers/loading", () => {
  let state: LoadingState;
  let notes: Notes;

  beforeEach(() => {
    notes = {};
    state = loadingReducer(undefined, A.startInitialScan(), notes);
  });

  describe("when initial-scan-done action without any new files found", () => {
    beforeEach(() => {
      state = loadingReducer(state, A.initialScanDone([]), notes);
    });

    it("should set status to done straight away", () => {
      expect(state.status).toEqual("done");
    });
  });

  describe("when file-added action", () => {
    beforeEach(() => {
      state = loadingReducer(
        state,
        A.fileAdded({
          filename: "a",
          stats: { mtime: new Date() }
        }),
        notes
      );
      state = loadingReducer(
        state,
        A.fileAdded({
          filename: "b",
          stats: { mtime: new Date() }
        }),
        notes
      );
    });

    it("should append raw files", () => {
      expect(state.status).toEqual("initialScan");
      if (state.status === "initialScan") {
        expect(state.rawFiles.length).toEqual(2);
        expect(state.rawFiles[0].filename).toEqual("a");
      }
    });

    describe("when initial-scan-done action", () => {
      beforeEach(() => {
        if (state.status === "initialScan") {
          const now = new Date();
          notes = {
            "a.txt": {
              ready: true,
              content: "has all",
              ext: ".txt",
              id: "1",
              name: "cached-from-prior-session",
              stats: { mtime: now }
            },
            "b.txt": {
              content: undefined,
              ext: ".txt",
              id: "1",
              name: "",
              stats: { mtime: now }
            },
            "c.txt": {
              content: undefined,
              ext: ".txt",
              id: "1",
              name: "last",
              stats: { mtime: now }
            }
          };
          state = loadingReducer(
            state,
            A.initialScanDone(state.rawFiles),
            notes
          );
        } else {
          throw new Error(
            `status is expected to be initialScan, was ${state.status}`
          );
        }
      });

      it("should change status to reading files", () => {
        expect(state.status === "readingFiles").toBe(true);
        if (state.status === "readingFiles") {
          expect(state.readyCount).toEqual(1);
          expect(state.totalCount).toEqual(3);
        }
      });

      describe("when a file is read", () => {
        beforeEach(() => {
          const result = {
            filename: "b.txt",
            notePropName: "content",
            value: "read content of this file"
          };
          notes["b.txt"].content = "read content of this file";
          notes["b.txt"].ready = true;
          state = loadingReducer(state, A.fileRead(result), notes);
        });

        it("should have updated ready count", () => {
          expect(state.status === "readingFiles").toBe(true);
          if (state.status === "readingFiles") {
            expect(state.readyCount).toEqual(2);
            expect(state.totalCount).toEqual(3);
          }
        });

        describe("when all files are read", () => {
          beforeEach(function() {
            state = loadingReducer(state, A.readFilesDone(), notes);
          });

          it("should change status", function() {
            expect(state.status === "done").toBe(true);
          });
        });
      });
    });
  });
});
