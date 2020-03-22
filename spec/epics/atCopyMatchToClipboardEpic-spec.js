/* @flow */

import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import atCopyMatchToClipboardEpic from "../../lib/epics/atCopyMatchToClipboardEpic";
import * as A from "../../lib/actions";
import statsMock from "../statsMock";

import type { State } from "../../flow-types/State";

describe("epics/atCopyMatchToClipboardEpic", () => {
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
        filesCount: 0,
      },
      notes: {
        "alice.txt": {
          id: "0",
          name: "alice",
          content: "nada",
          ext: "txt",
          path: "/notes/alice.txt",
          stats: statsMock({ mtime: new Date() }),
        },
        "bob.md": {
          id: "1",
          name: "bob",
          content: "foo @copy(bar) baz",
          ext: "md",
          path: "/notes/bob.md",
          stats: statsMock({ mtime: new Date() }),
        },
        "cesar.txt": {
          id: "2",
          name: "cesar",
          ext: "txt",
          path: "/notes/cesar.txt",
          stats: statsMock({ mtime: new Date() }),
        },
      },
      queryOriginal: "",
      rowHeight: 25,
      scrollTop: 0,
      selectedNote: {
        index: 0,
        filename: "alice.md",
      },
      sifterResult: {
        items: [
          { id: "alice.txt", score: 1.0 },
          { id: "bob.md", score: 0.9 },
          { id: "cesar.txt", score: 0.8 },
        ],
        options: {
          fields: ["name", "ext"],
          sort: [
            { field: "name", direction: "asc" },
            { field: "$score", direction: "desc" },
          ],
        },
        query: "",
        tokens: [],
        total: 3,
      },
    };

    jasmine.Clock.useMock();
    spyOn(atom.clipboard, "write");

    const epicMiddleware = createEpicMiddleware();
    const mockStore = configureMockStore([epicMiddleware]);
    store = mockStore(state);
    epicMiddleware.run(atCopyMatchToClipboardEpic);

    // dummy events, just to have action$ to have a value to start with
    store.dispatch(A.resizeList(123));
    store.clearActions();
  });

  afterEach(function () {
    jasmine.useRealClock();
  });

  it("should put wrapped text into clipboard", function () {
    store.dispatch(A.selectNote("alice.md"));
    jasmine.Clock.tick(1000);
    expect(atom.clipboard.write).not.toHaveBeenCalledWith();

    // select note that have @copy directive
    (state: any).selectedNote = {
      index: 1,
      filename: "bob.md",
    };
    store.dispatch(A.selectNote("bob.md"));
    jasmine.Clock.tick(1000);
    expect(atom.clipboard.write).toHaveBeenCalledWith("bar");
  });
});
