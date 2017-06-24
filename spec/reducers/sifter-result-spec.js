/* @flow */

import * as A from "../../lib/action-creators";
import NoteFields from "../../lib/note-fields";
import SifterResultReducer from "../../lib/reducers/sifter-result";

describe("reducers/sifter-result", () => {
  let state: SifterResult;
  let notes: Notes;
  let sifterResultReducer;

  describe("when initial-scan-done action", function() {
    beforeEach(function() {
      const noteFields = new NoteFields();
      noteFields.add({ notePropName: "name" });
      noteFields.add({ notePropName: "ext" });

      notes = {
        "alice.md": {
          id: "0",
          ext: "md",
          name: "alice",
          stats: { mtime: new Date() }
        },
        "bob.md": {
          id: "1",
          ext: "md",
          name: "bob",
          stats: { mtime: new Date() }
        },
        "cesar.txt": {
          id: "2",
          ext: "txt",
          name: "cesar",
          stats: { mtime: new Date() }
        },
        "david.txt": {
          id: "3",
          ext: "txt",
          name: "david",
          stats: { mtime: new Date() }
        },
        "eric.md": {
          id: "4",
          ext: "md",
          name: "eric",
          stats: { mtime: new Date() }
        }
      };

      sifterResultReducer = SifterResultReducer(noteFields);
      state = sifterResultReducer(undefined, A.startInitialScan(), notes);
    });

    describe("when initial scan is done", function() {
      beforeEach(function() {
        state = sifterResultReducer(state, A.initialScanDone(), notes);
      });

      it("should return results for empty query", function() {
        expect(state.query).toEqual("");
        expect(state.items.length).toBeGreaterThan(0);
      });
    });

    describe("when reset search", function() {
      beforeEach(function() {
        state = sifterResultReducer(state, A.resetSearch(), notes);
      });

      it("should return results for empty query", function() {
        expect(state.query).toEqual("");
        expect(state.items.length).toBeGreaterThan(0);
      });
    });

    describe("when changed sort field", function() {
      beforeEach(function() {
        state = sifterResultReducer(state, A.changeSortField("name"), notes);
      });

      it("should return results", function() {
        expect(state.items.length).toBeGreaterThan(0);
        expect(state.query).toEqual("");
      });

      it("should order by new sort field", function() {
        const ids = state.items.map(x => x.id);
        expect(ids).toEqual(ids.sort());
      });
    });

    describe("when changed sort direction", function() {
      beforeEach(function() {
        state = sifterResultReducer(
          state,
          A.changeSortDirection("desc"),
          notes
        );
      });

      it("should return results", function() {
        expect(state.items.length).toBeGreaterThan(0);
        expect(state.query).toEqual("");
      });

      it("should order by new sort direction", function() {
        const ids = state.items.map(x => x.id);
        expect(ids).toEqual(ids.sort().reverse());
      });
    });

    describe("when search", function() {
      beforeEach(function() {
        state = sifterResultReducer(state, A.search("md"), notes);
      });

      it("should update query", function() {
        expect(state.query).toEqual("md");
      });

      it("should return results matching query", function() {
        expect(state.total).toEqual(3);
        expect(state.items.length).toEqual(3);
        expect(state.items[0].id).toEqual("alice.md");
      });

      it("should return regexp for matched token", function() {
        expect(state.tokens).toEqual(jasmine.any(Array));
        expect(state.tokens[0]).toEqual({
          string: "md",
          regex: jasmine.any(RegExp)
        });
      });

      it("should have default sort", function() {
        expect(state.options.sort[0]).toEqual({
          field: "$score",
          direction: "desc"
        });
      });

      describe("when sort have been set", function() {
        beforeEach(function() {
          state.options.sort.unshift({ field: "name", direction: "asc" });
          state = sifterResultReducer(state, A.search("md"), notes);
        });

        it("should use sort defined by state", function() {
          expect(state.options.sort[0]).toEqual({
            field: "name",
            direction: "asc"
          });
        });

        it("should use default sort as secondary fallback", function() {
          expect(state.options.sort[1]).toEqual({
            field: "$score",
            direction: "desc"
          });
        });
      });
    });

    describe("when add file", function() {
      sharedUpdateSearchFile(
        A.fileAdded({
          filename: "alice.txt",
          stats: { mtime: new Date() }
        })
      );
    });

    describe("when changed file", function() {
      sharedUpdateSearchFile(
        A.fileChanged({
          filename: "alice.txt",
          stats: { mtime: new Date() }
        })
      );
    });

    describe("when read file", function() {
      sharedUpdateSearchFile(
        A.fileRead({
          filename: "alice.txt",
          notePropName: "content",
          value: "content for alice.txt"
        })
      );
    });

    describe("when any other action", function() {
      let prevState;

      beforeEach(function() {
        prevState = state;
        state = sifterResultReducer(state, A.scroll(0), notes);
      });

      it("should return prev state", function() {
        expect(state).toBe(prevState);
      });
    });

    function sharedUpdateSearchFile(action: Action) {
      let prevState;

      beforeEach(function() {
        prevState = state;
        state.query = "abc";
        state = sifterResultReducer(state, action, notes);
      });

      it("should update search w/ existing query", function() {
        expect(state).not.toBe(prevState);
        expect(state.query).toEqual("abc");
      });
    }
  });
});
