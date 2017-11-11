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
        rawFiles: []
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

  afterEach(() => {
    store.dispatch(A.dispose()); // should terminate any running processes
  });

  describe("when start-initial-scan action is triggered", () => {
    beforeEach(() => {
      store.dispatch(A.startInitialScan());

      // wait for initial scan to be done (i.e. the last expected action), implicitly verifies that to work, too
      waitsFor(
        () => store.getActions().slice(-1)[0].type === A.INITIAL_SCAN_DONE
      );
    });

    it("should have yielded file-added actions for each file", () => {
      expect(store.getActions().length).toEqual(5);

      const action: any = store.getActions()[1];
      expect(action.type).toEqual(A.FILE_ADDED);
      expect(action.rawFile).toEqual(jasmine.any(Object));
      expect(action.rawFile.filename).toMatch(/note-\d\.txt/);

      const actions = store.getActions().slice(1, -1);
      const filenames = actions.map(action => {
        if (action.type === A.FILE_ADDED) {
          return action.rawFile.filename;
        } else {
          return action.type;
        }
      });
      expect(filenames).toEqual(["note-1.txt", "note-2.md", "note-3.txt"]);
    });

    it("should have converted stats strings to date object", () => {
      const action: any = store.getActions()[1];
      expect(action.rawFile.stats).toEqual(jasmine.any(Object));
      expect(action.rawFile.stats.atime).toEqual(jasmine.any(Date));
      expect(action.rawFile.stats.birthtime).toEqual(jasmine.any(Date));
      expect(action.rawFile.stats.ctime).toEqual(jasmine.any(Date));
      expect(action.rawFile.stats.mtime).toEqual(jasmine.any(Date));
    });
  });
});
