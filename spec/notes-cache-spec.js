"use babel";

import tempy from "tempy";
import NotesCache from "../lib/notes-cache";

describe("notes-cache", () => {
  let notes, notesCache;

  beforeEach(function() {
    const tempDirPath = tempy.directory();
    notesCache = new NotesCache(tempDirPath);
    spyOn(console, "warn");
  });

  afterEach(function() {
    notesCache.dispose();
  });

  it("should save and load notes", function() {
    notes = notesCache.load();
    expect(notes).toEqual({});

    notesCache.save({ "some-file": { foo: "bar" } });
    notes = notesCache.load();
    expect(notes).toEqual({ "some-file": { foo: "bar" } });
  });

  it("should not save notes after clear-notes-cache command is called", function() {
    notes = notesCache.load();

    const workspaceView = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceView);
    atom.commands.dispatch(workspaceView, "textual-velocity:clear-notes-cache");

    try {
      notesCache.save({ "some-file": { foo: "bar" } });
    } catch (err) {
      throw err;
    }
    notes = notesCache.load();
    expect(notes).toEqual({});
  });
});
