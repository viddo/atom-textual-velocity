/* @flow */

import tempy from "tempy";
import NotesCache from "./NotesCache";

describe("NotesCache", () => {
  let actual, notesCache, expected: any;

  beforeEach(function() {
    const tempDirPath = tempy.directory();
    expected = { "some-file": { foo: "bar" } };
    notesCache = new NotesCache(tempDirPath);
    spyOn(console, "warn");
  });

  afterEach(function() {
    notesCache.dispose();
  });

  it("should save and load notes", function() {
    actual = notesCache.load();
    expect(actual).toEqual({});

    notesCache.save(expected);
    actual = notesCache.load();
    expect(actual).toEqual(expected);
  });

  it("should not save notes after clear-notes-cache command is called", function() {
    actual = notesCache.load();

    const workspaceView = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceView);
    atom.commands.dispatch(workspaceView, "textual-velocity:clear-notes-cache");

    try {
      notesCache.save(expected);
    } catch (err) {
      throw err;
    }
    actual = notesCache.load();
    expect(actual).toEqual({});
  });
});
