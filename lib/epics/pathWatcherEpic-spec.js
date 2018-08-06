/* @flow */

import fs from "fs";
import Path from "path";
import tempy from "tempy";
import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import pathWatcherEpic from "./pathWatcherEpic";
import NotesFileFilter from "../NotesFileFilter";
import * as A from "../actions";
import { beforeEach } from "../async-spec-helpers";
import type { State } from "../../flow-types/State";

let watcherTimeout;

describe("epics/pathWatcherEpic", () => {
  let dir, store, fullpath, note1Path, note2Path;

  beforeEach(async () => {
    jasmine.useRealClock();

    const tempDirPath = tempy.directory();
    dir = fs.realpathSync(tempDirPath);

    fullpath = (path, root = dir) => Path.join(root, path);

    note1Path = fullpath("note-1.txt");
    note2Path = fullpath("note-2.txt");
    fs.writeFileSync(note1Path, "1");
    fs.writeFileSync(note2Path, "2");

    const notesFileFilter = new NotesFileFilter(dir, {
      exclusions: [".DS_Store"],
      excludeVcsIgnoredPaths: true
    });
    const epicMiddleware = createEpicMiddleware({
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
    epicMiddleware.run(pathWatcherEpic);

    await Promise.all([
      pathWatcherReady(),
      new Promise(resolve => {
        // enforce spec to wait, to make sure underlying watcher doesn't interpet too rapid changes as initial event
        // e.g. created+modifed file in a short period of time will only yield a created event
        setTimeout(resolve, 1200);
      })
    ]);
  });

  afterEach(() => {
    store.dispatch(A.dispose()); // should terminate any running processes
    clearTimeout(watcherTimeout);
  });

  describe("when a new file is created", () => {
    beforeEach(() => {
      store.clearActions();

      // should not be accepted
      const aDir = fullpath("a-dir");
      fs.mkdirSync(aDir);
      fs.writeFileSync(fullpath("test", aDir), "should not be accepted");

      fs.writeFileSync(fullpath("note-NEW.md"), "my new file!");
      fs.writeFileSync(fullpath(".DS_Store"), "should not be accepted");
      fs.writeFileSync(fullpath("note-ALSO-NEW"), "another new file!");

      waitsFor(() => store.getActions().length >= 2);
    });

    it("should yield file added actions for all new files", () => {
      // linux system yields more than the created events, so keep tests a bit more laxed
      const actions: any[] = store
        .getActions()
        .filter(action => action.type === A.FILE_ADDED);

      expect(actions[0]).toEqual({
        type: A.FILE_ADDED,
        rawFile: {
          filename: "note-NEW.md",
          stats: jasmine.objectContaining({
            birthtime: jasmine.any(Date),
            mtime: jasmine.any(Date)
          })
        }
      });
      expect(actions[1]).toEqual({
        type: A.FILE_ADDED,
        rawFile: {
          filename: "note-ALSO-NEW",
          stats: jasmine.objectContaining({
            birthtime: jasmine.any(Date),
            mtime: jasmine.any(Date)
          })
        }
      });
    });
  });

  describe("when a file is modified", () => {
    beforeEach(() => {
      store.clearActions();
      fs.writeFileSync(note1Path, "update this one");
      waitsFor(() => store.getActions().length >= 1);
    });

    it("should yield a file changed action", () => {
      const action: any = store.getActions()[0];
      expect(action).toEqual({
        type: A.FILE_CHANGED,
        rawFile: {
          filename: "note-1.txt",
          stats: jasmine.objectContaining({
            birthtime: jasmine.any(Date),
            mtime: jasmine.any(Date)
          })
        }
      });
    });
  });

  describe("when a file is deleted", () => {
    beforeEach(() => {
      store.clearActions();
      fs.unlinkSync(note1Path);
      waitsFor(() => store.getActions().length >= 1);
    });

    it("should yield a deleted file action", () => {
      const action: any = store.getActions()[0];
      expect(action).toEqual({
        type: A.FILE_DELETED,
        filename: "note-1.txt"
      });
    });
  });

  describe("when file is renamed", () => {
    let renamedPath;

    beforeEach(() => {
      store.clearActions();
      renamedPath = fullpath("note-42.md");
      fs.renameSync(note1Path, renamedPath);
      waitsFor(() => store.getActions().length >= 1);
    });

    it("should yield both a deleted file and added file action", () => {
      const actions: any[] = store.getActions();
      if (actions[0].type === A.FILE_RENAMED) {
        expect(actions).toEqual([
          {
            type: A.FILE_RENAMED,
            filename: "note-42.md",
            oldFilename: "note-1.txt"
          }
        ]);
      } else {
        // NOTE: on MacOSX not getting the renamed events as documented for some reason,
        // so have to continue handling the separate deleted-created events for now
        // only seems to happen in this test env though, in real Atom env the rename event is yielded
        waitsFor(() => store.getActions().length >= 2);
        runs(() => {
          expect(actions).toEqual([
            {
              type: A.FILE_DELETED,
              filename: "note-1.txt"
            },
            {
              type: A.FILE_ADDED,
              rawFile: {
                filename: "note-42.md",
                stats: jasmine.objectContaining({
                  birthtime: jasmine.any(Date),
                  mtime: jasmine.any(Date)
                })
              }
            }
          ]);
        });
      }
    });
  });
});

function pathWatcherReady() {
  return new Promise(resolve => {
    const tryWatcher = async () => {
      const { watcher } = global.getProcessInTesting(process);
      if (watcher) {
        await watcher.getStartPromise();
        resolve("ready!");
      } else {
        watcherTimeout = setTimeout(tryWatcher, 50);
      }
    };
    tryWatcher();
  });
}
