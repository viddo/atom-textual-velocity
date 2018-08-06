/* @flow */

import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import writeNVtagsEpic from "./writeNVtagsEpic";
import NVtags from "../NVtags";
import statsMock from "../statsMock";
import * as showWarningNotificationImport from "../showWarningNotification";
import * as A from "../actions";
import type { State } from "../../flow-types/State";

describe("epics/writeNVtagsEpic", () => {
  let store;

  beforeEach(() => {
    const epicMiddleware = createEpicMiddleware();
    const mockStore = configureMockStore([epicMiddleware]);
    const state: State = {
      columnHeaders: [],
      dir: "/notes",
      editCellName: "nvtags",
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
    epicMiddleware.run(writeNVtagsEpic);
    spyOn(NVtags, "write");
  });

  afterEach(function() {
    store.clearActions();
    store.dispatch(A.dispose()); // tests dispose logic working
  });

  if (NVtags.unsupportedError) {
    it("should do nothing", function() {
      store.dispatch(A.editCellSave("beep boop"));
      expect(NVtags.write).not.toHaveBeenCalled();
    });
  } else {
    describe("when save edited cell value", function() {
      beforeEach(function() {
        store.dispatch(A.editCellSave("beep boop"));
      });

      it("renames writes value as NVtags", function() {
        expect(NVtags.write).toHaveBeenCalledWith(
          "/notes/alice.txt",
          "beep boop",
          jasmine.any(Function)
        );
      });

      it("sends a done action", () => {
        expect(store.getActions().slice(-1)[0]).toEqual(A.editCellDone());
      });

      describe("when write fails", function() {
        beforeEach(function() {
          spyOn(showWarningNotificationImport, "showWarningNotification");
        });

        it("should show warning notification", function() {
          NVtags.write.calls[0].args[2](null);
          expect(
            showWarningNotificationImport.showWarningNotification
          ).not.toHaveBeenCalled();

          NVtags.write.calls[0].args[2](new Error("failed to write file"));
          expect(
            showWarningNotificationImport.showWarningNotification
          ).toHaveBeenCalled();
        });
      });
    });
  }
});
