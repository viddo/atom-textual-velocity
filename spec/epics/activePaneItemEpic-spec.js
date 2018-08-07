/* @flow */

import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import activePaneItemEpic from "../../lib/epics/activePaneItemEpic";
import * as A from "../../lib/actions";
import statsMock from "../statsMock";
import { PREVIEW_EDITOR_TITLE } from "../../lib/previewEditor";

import type { State } from "../../flow-types/State";

describe("epics/activePaneItemEpic", () => {
  let state: State;
  let store;

  beforeEach(() => {
    state = {
      columnHeaders: [],
      dir: "/notes",
      editCellName: null,
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
        },
        "bob.md": {
          id: "1",
          name: "bob",
          ext: "md",
          path: "/notes/bob.md",
          stats: statsMock({ mtime: new Date() })
        },
        "cesar.txt": {
          id: "2",
          name: "cesar",
          ext: "txt",
          path: "/notes/cesar.txt",
          stats: statsMock({ mtime: new Date() })
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

    jasmine.useRealClock();
    jasmine.Clock.useMock();
    spyOn(Date, "now").andReturn(0);

    const epicMiddleware = createEpicMiddleware();
    const mockStore = configureMockStore([epicMiddleware]);
    store = mockStore(state);
    epicMiddleware.run(activePaneItemEpic);

    // dummy events, just to have action$ to have a value to start with
    store.dispatch(A.resizeList(123));
    atom.workspace.open("/notes/adam.md");
    store.clearActions();
  });

  describe("when active pane item is changed due to non-package interaction (e.g. open recent file or such)", function() {
    beforeEach(function() {
      Date.now.andReturn(500); // a non-package interaction should occur after a significant amount of time since last event

      waitsForPromise(() => {
        return atom.workspace.open("/notes/bob.md").then(() => {
          jasmine.Clock.tick(1000);
        });
      });
    });

    it("should dispatch action to select matching note", function() {
      expect(store.getActions().slice(-1)[0]).toEqual(
        A.changedActivePaneItem("/notes/bob.md")
      );
    });
  });

  describe("when active pane item is changed due to interaction with plugin, e.g. select note (=> preview)", function() {
    beforeEach(function() {
      waitsForPromise(() => {
        return atom.workspace.open("/notes/untitled.md").then(() => {
          jasmine.Clock.tick(1000);
        });
      });
    });

    it("should not dispatch any action", function() {
      expect(store.getActions()).toEqual([]);
    });
  });

  describe("when active pane item is the preview editor", function() {
    beforeEach(function() {
      waitsForPromise(() => {
        return atom.workspace.open("/notes/bob.md").then(() => {
          atom.workspace.getActiveTextEditor().getTitle = () =>
            PREVIEW_EDITOR_TITLE;
          jasmine.Clock.tick(1000);
        });
      });
    });

    it("should not dispatch any action", function() {
      expect(store.getActions()).toEqual([]);
    });
  });
});
