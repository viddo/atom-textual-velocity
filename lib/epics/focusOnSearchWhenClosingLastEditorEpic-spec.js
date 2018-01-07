/* @flow */

import configureMockStore from "redux-mock-store";
import { createEpicMiddleware } from "redux-observable";
import focusOnSearchWhenClosingLastEditorEpic from "./focusOnSearchWhenClosingLastEditorEpic";
import * as A from "../actions";
import { beforeEach } from "../async-spec-helpers";

describe("epics/focusOnSearchWhenClosingLastEditorEpic", () => {
  let store;
  let cmdSpy;

  beforeEach(async () => {
    jasmine.useRealClock();
    jasmine.Clock.useMock();

    const epicMiddleware = createEpicMiddleware(
      focusOnSearchWhenClosingLastEditorEpic
    );
    const mockStore = configureMockStore([epicMiddleware]);
    store = mockStore();

    // dummy events, just to have action$ to have a value to start with
    store.clearActions();
    store.dispatch(A.search(""));

    cmdSpy = jasmine.createSpy("focus-on-search");
    atom.commands.add(
      "atom-workspace",
      "textual-velocity:focus-on-search",
      cmdSpy
    );
    await Promise.all([
      atom.workspace.open("test1"),
      atom.workspace.open("test2")
    ]);
  });

  afterEach(function() {
    store.dispatch(A.dispose());
  });

  describe("when closing last active editor", function() {
    beforeEach(() => {});
    it("should focus on search", () => {
      closeActiveEditor();
      expect(cmdSpy).not.toHaveBeenCalled();

      closeActiveEditor();
      expect(cmdSpy).toHaveBeenCalled();
    });
  });
});

function closeActiveEditor() {
  const editor = atom.workspace.getActiveTextEditor();
  const pane = atom.workspace.paneForItem(editor);
  if (pane) {
    pane.destroyItem(editor);
  }
  jasmine.Clock.tick(200);
}
