/* @flow */

import fs from "fs";
import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import * as A from "../actions";
import * as showWarningNotificationImport from "../showWarningNotification";
import renameNoteEpic from "./renameNoteEpic";
import statsMock from "../statsMock";
import type { State } from "../flow-types/State";

describe("epics/renameNoteEpic", () => {
  let store;

  beforeEach(() => {
    const epicMiddleware = createEpicMiddleware(renameNoteEpic);
    const mockStore = configureMockStore([epicMiddleware]);
    const state: State = {
      columnHeaders: [],
      dir: "/notes",
      editCellName: "name",
      fileReadFails: {},
      listHeight: 75,
      loading: {
        status: "readDir",
        filesCount: 0
      },
      notes: {
        "alice.txt": {
          id: "0",
          name: "alice",
          ext: "txt",
          path: "/notes/alice.txt",
          stats: statsMock({ mtime: new Date() })
        }
      },
      queryOriginal: "",
      rowHeight: 25,
      scrollTop: 0,
      selectedNote: { index: 0, filename: "alice.txt" },
      sifterResult: {
        items: [{ id: "alice.txt", score: 1.0 }],
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

    store = mockStore(state);
    spyOn(fs, "rename");
  });

  afterEach(function() {
    store.clearActions();
    store.dispatch(A.dispose()); // tests dispose logic working
  });

  describe("when save edited cell value", function() {
    it("renames current selected file", function() {
      store.dispatch(A.editCellSave("new.md"));
      expect(fs.rename).toHaveBeenCalledWith(
        "/notes/alice.txt",
        "/notes/new.md",
        jasmine.any(Function)
      );
      expect(store.getActions().slice(-1)[0]).toEqual(A.editCellDone());
    });

    it("does nothing for some cases", function() {
      store.dispatch(A.editCellSave("   "));
      expect(fs.rename).not.toHaveBeenCalled();

      store.dispatch(A.editCellSave(".ext"));
      expect(fs.rename).not.toHaveBeenCalled();
    });

    it("normalize the path for some common cases", function() {
      store.dispatch(A.editCellSave("  nope/last.md  "));
      waitsFor(() => fs.rename.calls.length > 0);
      expect(fs.rename).toHaveBeenCalledWith(
        "/notes/alice.txt",
        "/notes/last.md",
        jasmine.any(Function)
      );
    });

    describe("when rename fails", function() {
      beforeEach(function() {
        store.dispatch(A.editCellSave("new.md"));
        spyOn(showWarningNotificationImport, "showWarningNotification");
      });

      it("should show warning notification", function() {
        fs.rename.calls[0].args[2](null);
        expect(
          showWarningNotificationImport.showWarningNotification
        ).not.toHaveBeenCalled();

        fs.rename.calls[0].args[2](new Error("failed to write file"));
        expect(
          showWarningNotificationImport.showWarningNotification
        ).toHaveBeenCalled();
      });
    });
  });
});
