/* @flow */

import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import FileWriters from "../../lib/file-writers";
import makeFileWritesEpic from "../../lib/epics/file-writes";
import * as A from "../../lib/action-creators";

describe("epics/file-writes", () => {
  let state: State;
  let store;
  let filenameFileWriter: FileWriter;
  let tagsFileWriter: FileWriter;
  let writeSpy;

  beforeEach(() => {
    const fileWriters = new FileWriters();
    writeSpy = jasmine.createSpy("write");
    tagsFileWriter = {
      editCellName: "nvtags",
      write: (path: string, str: string, callback: NodeCallback) => {
        callback(new Error("this should never have been called!"));
      }
    };
    fileWriters.add(tagsFileWriter);
    filenameFileWriter = {
      editCellName: "filename",
      write: function(path: string, str: string, callback: NodeCallback) {
        writeSpy(...arguments);
      }
    };
    fileWriters.add(filenameFileWriter);

    const fileWritesEpic = makeFileWritesEpic(fileWriters);
    const epicMiddleware = createEpicMiddleware(fileWritesEpic);
    const mockStore = configureMockStore([epicMiddleware]);

    state = {
      columnHeaders: [],
      dir: "/notes",
      editCellName: null,
      initialScan: {
        done: true,
        rawFiles: []
      },
      listHeight: 50,
      notes: {},
      queryOriginal: "",
      rowHeight: 25,
      scrollTop: 0,
      selectedNote: null,
      sifterResult: {
        items: [],
        options: {
          fields: ["name", "ext"],
          sort: [
            { field: "name", direction: "asc" },
            { field: "$score", direction: "desc" }
          ]
        },
        query: "",
        tokens: [],
        total: 0
      }
    };
    store = mockStore(state);
  });

  afterEach(function() {
    store.dispatch(A.dispose()); // tests dispose logic working

    store.clearActions();
    const finalAction = A.editCellSave(
      "filename",
      "should not be picked up anymore"
    );
    store.dispatch(finalAction);
    expect(store.getActions()).toEqual(
      [finalAction],
      "should not have any other actions dispatched anymore"
    );
  });

  describe("when saving edited cell", function() {
    beforeEach(function() {
      spyOn(atom.notifications, "addError").andCallThrough();
      state.selectedNote = {
        filename: "foobar.txt",
        index: 1
      };
      store.dispatch(A.editCellSave("filename", "value to save"));
    });

    it("should try to write value to selected note", function() {
      expect(writeSpy).toHaveBeenCalled();
      expect(writeSpy.calls[0].args[0]).toEqual("/notes/foobar.txt");
      expect(writeSpy.calls[0].args[1]).toEqual("value to save");
    });

    describe("when save write succeed", function() {
      beforeEach(function() {
        writeSpy.calls[0].args[2](null, "value to save");
      });

      it("should not add any error", function() {
        expect(atom.notifications.addError).not.toHaveBeenCalled();
      });
    });

    describe("when save write fails", function() {
      beforeEach(function() {
        writeSpy.calls[0].args[2](
          new Error("oh dear, something went wrong…"),
          null
        );
      });

      it("should add an error explaining the situation", function() {
        expect(atom.notifications.addError).toHaveBeenCalled();
      });
    });
  });
});
