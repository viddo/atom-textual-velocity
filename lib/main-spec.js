/* @flow */
/* global CustomEvent */

import Path from "path";
import { it } from "./async-spec-helpers";

const BASE_PATH = Path.join(__dirname, "fixtures", "standard");

describe("main", () => {
  it("works from start to stop of session", async () => {
    jasmine.useRealClock();
    const workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
    atom.configDirPath = BASE_PATH;
    atom.config.set("textual-velocity.path", BASE_PATH); // ./spec

    // Spy on fatal notifications to extract activationErroror, to re-throw it here
    spyOn(atom.notifications, "addFatalError").andCallFake((msg, d) => {
      const err = new Error([msg, d.detail, d.stack].join("\n"));
      jasmine.getEnv().currentSpec.fail(err);
    });
    spyOn(console, "error").andCallFake((msg, explanation = "") => {
      const err = new Error(msg + explanation.toString());
      jasmine.getEnv().currentSpec.fail(err);
    });

    // should lazy-load package
    expect(atom.packages.isPackageLoaded("textual-velocity")).toBe(false);
    expect(atom.packages.isPackageActive("textual-velocity")).toBe(false);

    // when start-session command is triggered
    const activatePromise = atom.packages.activatePackage("textual-velocity");
    workspaceElement.dispatchEvent(
      new CustomEvent("textual-velocity:start-session", { bubbles: true })
    );
    await activatePromise;
    const panel: atom$Panel = atom.workspace.getTopPanels().slice(-1)[0];

    // should create a top panel for the session
    expect(panel.getItem().querySelector(".textual-velocity")).toEqual(
      jasmine.any(HTMLElement)
    );

    // should replace start-session command with a stop-session command
    let commands = atom.commands.getSnapshot();
    expect(commands["textual-velocity:start-session"]).toBeUndefined();
    expect(commands["textual-velocity:stop-session"]).toBeDefined();

    // when files are loaded
    await loadingDone();

    // should render rows
    expect(panel.getItem().innerHTML).toContain("<input");

    // when stop-session command is triggered
    workspaceElement.dispatchEvent(
      new CustomEvent("textual-velocity:stop-session", { bubbles: true })
    );

    // should not render any top panels anymore
    expect(atom.workspace.getTopPanels()).toEqual([]);

    // should replace stop-session command with a start-session command
    commands = atom.commands.getSnapshot();
    expect(commands["textual-velocity:start-session"]).toBeDefined();
    expect(commands["textual-velocity:stop-session"]).toBeUndefined();
  });
});

function loadingDone() {
  return new Promise((resolve, reject) => {
    const { store } = global.getProcessInTesting(process);
    if (store) {
      const unsubscribe = store.subscribe(() => {
        const state: State = store.getState();
        if (state.loading.status === "done") {
          unsubscribe();
          resolve();
        }
      });
    } else {
      reject(new Error("expected to get store for testing env"));
    }
  });
}
