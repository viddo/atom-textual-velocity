/* @flow */

import { createEpicMiddleware } from "redux-observable";
import configureMockStore from "redux-mock-store";
import makeHiddenColumnsEpic from "../../lib/epics/hidden-columns";
import Columns from "../../lib/columns";
import SummaryColumn from "../../lib/columns/summary-column";
import FileIconColumn from "../../lib/columns/file-icon-column";
import * as A from "../../lib/action-creators";

describe("epics/hidden-columns", () => {
  let store;
  let workspaceElement;
  let contextMenuItems;
  let contextMenuItemsLabels;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    const columns = new Columns();
    columns.add(new SummaryColumn({ sortField: "name", editCellName: "" }));
    columns.add(new FileIconColumn({ sortField: "ext" }));

    spyOn(atom.contextMenu, "add").andCallThrough();

    const hiddenColumnsEpic = makeHiddenColumnsEpic(columns);
    const epicMiddleware = createEpicMiddleware(hiddenColumnsEpic);
    const mockStore = configureMockStore([epicMiddleware]);

    contextMenuItems = () =>
      atom.contextMenu.add.calls.slice(-1)[0].args[0][
        ".textual-velocity .header"
      ];
    contextMenuItemsLabels = () =>
      contextMenuItems().map(item => item["label"]);

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
