"use babel";

import { it, fit } from "./_async-spec-helpers"; // eslint-disable-line
import NotesCache from "../lib/notes-cache";

describe("notes-cache", () => {
  let notes, notesCache;

  beforeEach(function() {
    atom.enablePersistence = true;
    atom.stateStore.clear();
    notesCache = new NotesCache("/notes");
  });

  afterEach(function() {
    atom.enablePersistence = false;
    notesCache.dispose();
    atom.stateStore.clear();
  });

  it("should save and load notes", async function() {
    notes = await notesCache.load();
    expect(notes).toEqual({});

    try {
      await notesCache.save({ "some-file": { foo: "bar" } });
    } catch (err) {
      this.fail("save should work");
    }
    notes = await notesCache.load();
    expect(notes).toEqual({ "some-file": { foo: "bar" } });
  });

  it("should not save notes after clear-notes-cache command is called", async function() {
    notes = await notesCache.load();

    const workspaceView = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceView);
    atom.commands.dispatch(workspaceView, "textual-velocity:clear-notes-cache");

    try {
      await notesCache.save({ "some-file": { foo: "bar" } });
    } catch (err) {
      this.fail("save should work");
    }
    notes = await notesCache.load();
    expect(notes).toEqual({});
  });
});
