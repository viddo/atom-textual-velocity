"use babel";
/* global CustomEvent */

import Path from "path";

fdescribe("main", () => {
  let workspaceElement;

  beforeEach(function() {
    jasmine.useRealClock();
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);

    atom.config.set("textual-velocity.path", __dirname); // ./spec

    // Spy on fatal notifications to extract activationErroror, to re-throw it here
    spyOn(atom.notifications, "addFatalError").andCallFake((msg, d) => {
      const err = new Error([msg, d.detail, d.stack].join("\n"));
      jasmine.getEnv().currentSpec.fail(err);
    });
    spyOn(console, "error").andCallFake((msg, explanation = "") => {
      const err = new Error(msg + explanation.toString());
      jasmine.getEnv().currentSpec.fail(err);
    });

    atom.configDirPath = Path.join(__dirname, "fixtures");
  });

  it("package is lazy-loaded", function() {
    expect(atom.packages.isPackageLoaded("textual-velocity")).toBe(false);
    expect(atom.packages.isPackageActive("textual-velocity")).toBe(false);
  });

  describe("when start-session command is triggered", function() {
    let panel;

    beforeEach(function() {
      const promise = atom.packages.activatePackage("textual-velocity");
      workspaceElement.dispatchEvent(
        new CustomEvent("textual-velocity:start-session", { bubbles: true })
      );
      waitsForPromise(() => {
        return promise;
      });
      runs(() => {
        panel = atom.workspace.getTopPanels().slice(-1)[0];
      });
    });

    afterEach(function() {
      atom.packages.deactivatePackage("textual-velocity");
      panel = null;
    });

    it("creates a top panel for the session", function() {
      expect(panel.getItem().querySelector(".textual-velocity")).toEqual(
        jasmine.any(HTMLElement)
      );
    });

    it("should replaced start-session command with a stop-session command", function() {
      const commands = atom.commands.getSnapshot();
      expect(commands["textual-velocity:start-session"]).toBeUndefined();
      expect(commands["textual-velocity:stop-session"]).toBeDefined();
    });

    describe("when files are loaded", function() {
      beforeEach(function() {
        waitsFor(() => {
          return panel.getItem().innerHTML.match("<input"); // implicitly asserts search input too
        });
      });

      it("should render rows", function() {
        expect(panel.getItem().innerHTML).toContain("tv-items");
      });

      describe("when stop-session command is triggered", function() {
        beforeEach(function() {
          const promise = atom.packages.activatePackage("textual-velocity");
          workspaceElement.dispatchEvent(
            new CustomEvent("textual-velocity:stop-session", { bubbles: true })
          );
          waitsForPromise(() => {
            return promise;
          });
        });

        it("should not render rows anymore", function() {
          expect(atom.workspace.getTopPanels()).toEqual([]);
        });

        it("should replaced stop-session command with a start-session command", function() {
          const commands = atom.commands.getSnapshot();
          expect(commands["textual-velocity:start-session"]).toBeDefined();
          expect(commands["textual-velocity:stop-session"]).toBeUndefined();
        });
      });
    });
  });
});
