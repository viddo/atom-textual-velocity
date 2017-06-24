/* @flow */

import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import previewNoteEpic from "../../lib/epics/preview-note";
import * as A from "../../lib/action-creators";

describe("epics/preview-note", () => {
  let state: State;
  let store;
  let mockStore;

  beforeEach(() => {
    jasmine.useRealClock();
    jasmine.Clock.useMock();
    state = {
      columnHeaders: [],
      dir: "/notes",
      editCellName: null,
      initialScan: {
        done: false,
        rawFiles: []
      },
      listHeight: 75,
      notes: {
        "alice.txt": {
          id: "0",
          name: "alice",
          ext: "txt",
          stats: { mtime: new Date() }
        },
        "bob.md": {
          id: "1",
          name: "bob",
          ext: "md",
          stats: { mtime: new Date() }
        },
        "cesar.txt": {
          id: "2",
          name: "cesar",
          ext: "txt",
          stats: { mtime: new Date() }
        }
      },
      queryOriginal: "",
      rowHeight: 25,
      scrollTop: 0,
      selectedNote: null,
      sifterResult: {
        items: [
          { id: "alice.txt", score: 1.0 },
          { id: "bob.md", score: 0.9 },
          { id: "cesar.txt", score: 0.8 }
        ],
        options: {
          fields: ["name", "ext"],
          sort: [
            { field: "name", direction: "asc" },
            { field: "$score", direction: "desc" }
          ]
        },
        query: "",
        tokens: [],
        total: 3
      }
    };

    const getState = () => ({ ...state }); // make sure state is unique for each action

    const epicMiddleware = createEpicMiddleware(previewNoteEpic);
    mockStore = configureMockStore([epicMiddleware]);
    store = mockStore(getState);
  });

  afterEach(function() {
    store.dispatch(A.dispose());
    jasmine.Clock.tick(500);

    // clean workspace state
    let count = 0;
    while (atom.workspace.getPaneItems().length) {
      atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow();
      if (count === 50) {
        throw new Error("infinite loop!");
      }
      count++;
    }
  });

  describe("when select note", function() {
    describe("when there is no editor for path", function() {
      beforeEach(function() {
        state.selectedNote = {
          filename: "alice.txt",
          index: 0
        };
        store.dispatch(A.selectNext());
        jasmine.Clock.tick(500);

        waitsFor(() => atom.workspace.getPaneItems().length > 0); // waits for preview
      });

      it("should open preview", function() {
        expect(
          atom.workspace.getPaneItems()[0].tagName.toLowerCase()
        ).toContain("preview");
      });

      it("should close preview when deselected note", function() {
        state.selectedNote = null;
        store.dispatch(A.resetSearch());
        jasmine.Clock.tick(500);

        waitsFor(() => atom.workspace.getPaneItems().length === 0);
      });

      describe("when click preview", function() {
        beforeEach(function() {
          atom.workspace.getPaneItems()[0].click();
          waitsFor(() => !atom.workspace.getPaneItems()[0].tagName);
        });

        it("should open editor for given preview", function() {
          expect(atom.workspace.getPaneItems()[0].getPath()).toEqual(
            jasmine.any(String)
          );
        });
      });

      describe("when dispose action", function() {
        beforeEach(function() {
          store.dispatch(A.dispose());
          jasmine.Clock.tick(500);
        });

        it("should dispose elements and no longer open any previews", function() {
          state.selectedNote = {
            filename: "alice.txt",
            index: 0
          };
          store.dispatch(A.selectNext());
          jasmine.Clock.tick(500);

          expect(atom.workspace.getPaneItems().length).toEqual(0);
        });
      });
    });

    describe("when a text editor for matching path is already open", function() {
      beforeEach(function() {
        atom.workspace.open("/notes/bob.md");
        state.selectedNote = {
          filename: "alice.txt",
          index: 0
        };
        store.dispatch(A.selectNext());
        jasmine.Clock.tick(500);

        waitsFor(() => atom.workspace.getPaneItems().length === 2);
        runs(() => {
          state.selectedNote = {
            filename: "bob.md",
            index: 1
          };
          store.dispatch(A.selectNext());
          jasmine.Clock.tick(500);
        });
        waitsFor(() => atom.workspace.getPaneItems().length === 1); // should close the preview
      });

      it("should reuse text editor as preview", function() {
        expect(atom.workspace.getPaneItems()[0].tagName).toBe(undefined); // not a preview
      });
    });
  });

  describe("when open-note action", function() {
    describe("when there is no selected note", function() {
      beforeEach(function() {
        store.dispatch(A.openNote());
        jasmine.Clock.tick(500);

        atom.config.set("textual-velocity.defaultExt", "abc");
        store.dispatch(A.openNote());
        jasmine.Clock.tick(500);

        waitsFor(() => atom.workspace.getPaneItems().length >= 2);
      });

      it("should open a new untitled file", function() {
        expect(atom.workspace.getPaneItems()[0].getPath()).toEqual(
          "/notes/untitled.md"
        );
      });

      it("should allow override defaut extension", function() {
        expect(atom.workspace.getPaneItems()[1].getPath()).toEqual(
          "/notes/untitled.abc"
        );
      });
    });

    describe("when there is a selected note", function() {
      beforeEach(function() {
        state.selectedNote = {
          index: 0,
          filename: "alice.txt"
        };
        store = mockStore(state);
        store.dispatch(A.openNote());
        waitsFor(() => atom.workspace.getPaneItems().length >= 2);
      });

      it("should open path of selected note", function() {
        expect(atom.workspace.getPaneItems()[0].getPath()).toEqual(
          "/notes/alice.txt"
        );
      });
    });
  });
});
