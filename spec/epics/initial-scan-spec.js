/* @flow */

import fs from "fs";
import Path from "path";
import tempy from "tempy";
import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import NotesFileFilter from "../../lib/notes-file-filter";
import makeInitialScanEpic from "../../lib/epics/initial-scan";
import * as A from "../../lib/action-creators";

describe("epics/initial-scan", () => {
  let dir, store;

  beforeEach(() => {
    jasmine.useRealClock(); // required for chokidar timers to work! e.g. atomic unlink events

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
    const initialScanEpic = makeInitialScanEpic(notesFileFilter);
    const epicMiddleware = createEpicMiddleware(initialScanEpic);
    const mockStore = configureMockStore([epicMiddleware]);
    const state: State = {
      columnHeaders: [],
      dir,
      editCellName: null,
      listHeight: 50,
      loading: {
        status: "initialScan",
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

  it("should trigger an initialScanDone action with all filtered paths", function() {
    const actions = store.getActions();
    expect(actions.slice(0, -1)).toEqual([
      { type: A.FILE_FOUND },
      { type: A.FILE_FOUND },
      { type: A.FILE_FOUND }
    ]);

    const tmp: any = actions.slice(-1);
    const lastAction: InitialScanDone = tmp[0];
    expect(lastAction.type).toEqual(A.INITIAL_SCAN_DONE);
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
