/* @flow */

import fs from "fs";
import Path from "path";
import tempy from "tempy";
import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import NotesFileFilter from "../../lib/notes-file-filter";
import readDirEpic from "../../lib/epics/read-dir";
import * as A from "../../lib/action-creators";
import * as C from "../../lib/action-constants";

describe("epics/initial-scan", () => {
  let dir, store;

  beforeEach(() => {
    jasmine.useRealClock();

    const tempDirPath = tempy.directory();
    dir = fs.realpathSync(tempDirPath);

    fs.writeFileSync(Path.join(dir, ".DS_Store"), "");
    fs.writeFileSync(Path.join(dir, "note-1.txt"), "1");
    fs.writeFileSync(Path.join(dir, "note-2.md"), "2");
    fs.writeFileSync(Path.join(dir, "other.zip"), "...");
    fs.mkdirSync(Path.join(dir, "maybe a directory"));
    fs.writeFileSync(Path.join(dir, "note-3.txt"), "3");

    const notesFileFilter = new NotesFileFilter(dir, {
      exclusions: [".DS_Store"],
      excludeVcsIgnoredPaths: true
    });
    const epicMiddleware = createEpicMiddleware(readDirEpic, {
      dependencies: {
        notesFileFilter
      }
    });
    const mockStore = configureMockStore([epicMiddleware]);
    const state: State = {
      columnHeaders: [],
      dir,
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

    waitsFor(() => store.getActions().length >= 4);
  });

  afterEach(function() {
    store.dispatch(A.dispose());
  });

  it("should trigger an readDirDone action with all filtered paths", function() {
    const actions = store.getActions();
    expect(actions.slice(0, -1)).toEqual([
      { type: C.FILE_FOUND },
      { type: C.FILE_FOUND },
      { type: C.FILE_FOUND }
    ]);

    const tmp: any = actions.slice(-1);
    const lastAction: ReadDirDone = tmp[0];
    expect(lastAction.type).toEqual(C.READ_DIR_DONE);
    expect(lastAction.rawFiles.length).toEqual(3);
    expect(lastAction.rawFiles[0]).toEqual({
      filename: jasmine.any(String),
      stats: jasmine.objectContaining({
        birthtime: jasmine.any(Date),
        mtime: jasmine.any(Date)
      })
    });
  });
});
