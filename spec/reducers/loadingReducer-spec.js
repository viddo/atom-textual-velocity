/* @flow */

import * as A from "../../lib/actions";
import loadingReducer from "../../lib/reducers/loadingReducer";
import statsMock from "../statsMock";

import type { FileReadFails } from "../../flow-types/File";
import type { LoadingState } from "../../flow-types/Loading";
import type { Notes } from "../../flow-types/Note";

describe("reducers/loadingReducer", () => {
  let state: LoadingState;
  let fileReadFails: FileReadFails;
  let notes: Notes;

  beforeEach(() => {
    notes = {};
    fileReadFails = {};
    state = loadingReducer(undefined, A.search(""), notes, fileReadFails);
  });

  describe("when initial-scan-done action without any new files found", () => {
    beforeEach(() => {
      state = loadingReducer(state, A.readDirDone([]), notes, fileReadFails);
    });

    it("should set status to done straight away", () => {
      expect(state.status).toEqual("done");
    });
  });

  describe("when file-found action", () => {
    beforeEach(() => {
      state = loadingReducer(state, A.fileFound(), notes, fileReadFails);
      state = loadingReducer(state, A.fileFound(), notes, fileReadFails);
    });

    it("should append raw files", () => {
      expect(state.status).toEqual("readDir");
      if (state.status === "readDir") {
        expect(state.filesCount).toEqual(2);
      }
    });

    describe("when initial-scan-done action", () => {
      beforeEach(() => {
        if (state.status === "readDir") {
          const readDirDoneAction = A.readDirDone([
            {
              filename: "a",
              stats: statsMock({ mtime: new Date() })
            },
            {
              filename: "b",
              stats: statsMock({ mtime: new Date() })
            }
          ]);
          const now = new Date();
          notes = {
            "a.txt": {
              ready: true,
              content: "has all",
              ext: ".txt",
              id: "1",
              name: "cached-from-prior-session",
              stats: statsMock({ mtime: now })
            },
            "b.txt": {
              content: undefined,
              ext: ".txt",
              id: "1",
              name: "",
              stats: statsMock({ mtime: now })
            },
            "c.txt": {
              content: undefined,
              ext: ".txt",
              id: "1",
              name: "last",
              stats: statsMock({ mtime: now })
            }
          };
          state = loadingReducer(
            state,
            readDirDoneAction,
            notes,
            fileReadFails
          );
        } else {
          throw new Error(
            `status is expected to be readDir, was ${state.status}`
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
          state = loadingReducer(
            state,
            A.fileRead(result),
            notes,
            fileReadFails
          );
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
            state = loadingReducer(
              state,
              A.readFilesDone(),
              notes,
              fileReadFails
            );
          });

          it("should change status", function() {
            expect(state.status === "done").toBe(true);
          });
        });
      });
    });
  });
});
