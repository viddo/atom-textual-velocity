/* @flow */

import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import fileReadsEpic from "./fileReadsEpic";
import FileReaders from "../FileReaders";
import * as A from "../actions";
import statsMock from "../statsMock";
import type fs from "fs";
import type { Action } from "../actions";
import type { FileReader } from "../flow-types/File";
import type { NodeCallback } from "../flow-types/NodeCallback";
import type { State } from "../flow-types/State";

describe("epics/fileReadsEpic", () => {
  let state: State;
  let store;
  let ContentFileReader: FileReader;

  beforeEach(() => {
    const fileReaders = new FileReaders();
    ContentFileReader = {
      notePropName: "content",
      read: (path: string, fileStats: fs.Stats, callback: NodeCallback) =>
        callback(null, `content for ${path}`)
    };
    fileReaders.add(ContentFileReader);

    const epicMiddleware = createEpicMiddleware(fileReadsEpic, {
      dependencies: {
        fileReaders
      }
    });
    const mockStore = configureMockStore([epicMiddleware]);

    state = {
      columnHeaders: [],
      dir: "/notes",
      editCellName: null,
      fileReadFails: {},
      listHeight: 50,
      loading: {
        status: "readDir",
        filesCount: 0
      },
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
    const finalAction = A.readDirDone([]);
    store.dispatch(finalAction);
    expect(store.getActions()).toEqual(
      [finalAction],
      "should not have any other actions dispatched anymore"
    );
  });

  describe("when readDirDone action is dispatched", function() {
    beforeEach(function() {
      const now = new Date();

      const rawFiles = [
        {
          filename: "nothing-changed.txt",
          stats: statsMock({ mtime: now })
        },
        {
          filename: "alice.txt",
          stats: statsMock({ mtime: new Date() })
        },
        {
          filename: "not-changed-but-missing-file-reader-value.txt",
          stats: statsMock({ mtime: now })
        },
        {
          filename: "changed-file.txt",
          stats: statsMock({ mtime: new Date() })
        },
        {
          filename: "bob.md",
          stats: statsMock({ mtime: new Date() })
        }
      ];

      const notes = {
        "nothing-changed.txt": {
          content: "has all",
          ext: ".txt",
          id: "1",
          name: "cached-from-prior-session",
          stats: statsMock({ mtime: now })
        },
        "not-changed-but-missing-file-reader-value.txt": {
          content: undefined,
          ext: ".txt",
          id: "1",
          name: "not-changed-but-missing-file-reader-value",
          stats: statsMock({ mtime: now })
        },
        "no-longer-existing.txt": {
          ext: ".txt",
          id: "2",
          name: "no-longer-existing",
          stats: statsMock({ mtime: new Date() })
        },
        "changed-file.txt": {
          ext: ".txt",
          id: "3",
          name: "changed-file-from-prior-session",
          stats: statsMock({ mtime: new Date(0) })
        }
      };

      state.loading = {
        status: "readingFiles",
        readyCount: 2,
        totalCount: Object.keys(notes).length
      };
      state.notes = notes;

      store.dispatch(A.readDirDone(rawFiles));
      waitsFor(() => store.getActions().length >= 5);
    });

    it("should not read a file that have not changed", function() {
      const action = store
        .getActions()
        .find((action: any) => action.filename === "nothing-changed.txt");

      expect(action).toBe(undefined);
    });

    it("should read file missing value matching file reader", function() {
      const action = store
        .getActions()
        .find(
          (action: any) =>
            action.filename === "not-changed-but-missing-file-reader-value.txt"
        );

      expect(action).toBeDefined();
    });

    it("should read changed file", function() {
      const action = store
        .getActions()
        .find(
          (action: any) =>
            action.filename === "not-changed-but-missing-file-reader-value.txt"
        );

      expect(action).toBeDefined();
    });

    it("should read new files", function() {
      let action;
      action = store
        .getActions()
        .find((action: any) => action.filename === "alice.txt");

      expect(action).toBeDefined();

      action = store
        .getActions()
        .find((action: any) => action.filename === "bob.md");

      expect(action).toBeDefined();
    });
  });

  describe("when file is added", function() {
    sharedFileSpecs(
      A.fileAdded({
        filename: "alice.txt",
        stats: statsMock({ mtime: new Date() })
      })
    );
  });

  describe("wen file is changed", function() {
    sharedFileSpecs(
      A.fileChanged({
        filename: "alice.txt",
        stats: statsMock({ mtime: new Date() })
      })
    );
  });

  function sharedFileSpecs(action: Action) {
    beforeEach(function() {
      spyOn(ContentFileReader, "read").andCallThrough();
    });

    describe("when initial scan is done", function() {
      beforeEach(function() {
        state.loading = {
          status: "readingFiles",
          readyCount: 0,
          totalCount: 1
        };
        store.clearActions();
        store.dispatch(action);
        waitsFor(() => store.getActions().length >= 1); // should have at least one more action apart from file-action
      });

      it("should read file", function() {
        expect(ContentFileReader.read).toHaveBeenCalled();
      });

      it("should dispatch a file-read action", function() {
        const lastAction = store.getActions().slice(-1)[0];
        expect(lastAction).toEqual(
          A.fileRead({
            filename: "alice.txt",
            notePropName: "content",
            value: "content for /notes/alice.txt"
          })
        );
      });
    });
  }
});
