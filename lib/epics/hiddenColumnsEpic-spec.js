/* @flow */

import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import { patchColumnsForTest } from "../Columns";
import hiddenColumnsEpic from "./hiddenColumnsEpic";
import SummaryColumn from "../columns/SummaryColumn";
import FileIconColumn from "../columns/FileIconColumn";
import * as A from "../actions";

const contextMenuItems = () =>
  atom.contextMenu.add.calls.slice(-1)[0].args[0][".textual-velocity .header"];
const contextMenuItemsLabels = () =>
  contextMenuItems().map(item => item["label"]);

describe("epics/hiddenColumnsEpic", () => {
  let store;
  let workspaceElement;

  patchColumnsForTest(() => new SummaryColumn(), () => new FileIconColumn());

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    spyOn(atom.contextMenu, "add").andCallThrough();

    const epicMiddleware = createEpicMiddleware(hiddenColumnsEpic);
    const mockStore = configureMockStore([epicMiddleware]);

    store = mockStore();
  });

  it("should yield actions for initial hidden columns", function() {
    const dispatchedActions = store.getActions();
    expect(dispatchedActions[0]).toEqual(A.changeHiddenColumns([]));
  });

  it("should register a contextmenu actions", function() {
    expect(atom.contextMenu.add).toHaveBeenCalled();

    expect(contextMenuItemsLabels()).toEqual(["✓ Summary", "✓ File type"]);

    const contextMenuCommands = contextMenuItems().map(item => item["command"]);
    const registeredCommands = atom.commands
      .findCommands({ target: workspaceElement })
      .filter(cmd => cmd.name.startsWith("textual-velocity"))
      .map(cmd => cmd.name);
    expect(registeredCommands).toEqual(contextMenuCommands);
  });

  describe("when toggling a column command", function() {
    it("should update hidden columns and labels", function() {
      store.clearActions();
      atom.commands.dispatch(
        workspaceElement,
        "textual-velocity:toggle-summary-column"
      );
      expect(store.getActions()[0]).toEqual(A.changeHiddenColumns(["summary"]));
      expect(contextMenuItemsLabels()).toEqual(["    Summary", "✓ File type"]);

      store.clearActions();
      atom.commands.dispatch(
        workspaceElement,
        "textual-velocity:toggle-file-type-column"
      );
      expect(store.getActions()[0]).toEqual(
        A.changeHiddenColumns(["summary", "file-type"])
      );
      expect(contextMenuItemsLabels()).toEqual([
        "    Summary",
        "    File type"
      ]);

      store.clearActions();
      atom.commands.dispatch(
        workspaceElement,
        "textual-velocity:toggle-summary-column"
      );
      expect(store.getActions()[0]).toEqual(
        A.changeHiddenColumns(["file-type"])
      );
      expect(contextMenuItemsLabels()).toEqual(["✓ Summary", "    File type"]);
    });
  });
});
