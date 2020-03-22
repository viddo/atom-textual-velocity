/* @flow */

import { Point } from "atom";
import { it } from "./async-spec-helpers";
import previewEditor from "../lib/previewEditor";

describe("previewEditor", function () {
  it("should behave as expected", async function () {
    let preview = previewEditor();

    await preview.openPreview("/notes/foo.md", "bar", []);
    expect(preview.getPath()).not.toEqual("/notes/foo.md");
    expect(preview.getPath()).toBeUndefined();
    expect(preview.getURI()).toBeUndefined();
    expect(preview.getText()).toEqual("bar");
    expect(preview.isModified()).toBeFalsy();
    expect(preview.isAlive()).toBeTruthy();
    expect(atom.workspace.getTextEditors()).toEqual([preview]);
    preview.destroy();
    expect(preview.isAlive()).toBeFalsy();

    // test creating a new editor w/ search term and call multiple times, should not have any duplicates
    preview = previewEditor();
    const content = "baz\nqux\nfoobar\ntrololol";
    await preview.openPreview("/notes/bar.md", content, [/foo/]);
    expect(preview.getText()).toEqual(content);
    expect(preview.isModified()).toBeFalsy();
    expect(preview.getCursorBufferPosition().row).toEqual(2);
    expect(atom.workspace.getTextEditors()).toEqual([preview]);
    // call again, resets markers
    await preview.openPreview("/notes/foo.md", "foobar", [/other/]);

    // only text is updated => should not trigger anything
    let openResult;
    const originalOpen = atom.workspace.open;
    spyOn(atom.workspace, "open").andCallFake((...args) => {
      openResult = originalOpen.apply(atom.workspace, args);
      return originalOpen;
    });
    preview.cursorMoved({
      textChanged: true,
      newBufferPosition: new Point(0, 0),
    });
    expect(atom.workspace.open).not.toHaveBeenCalled();

    // cursor moves => should destroy preview and open normal editor in its place
    preview.cursorMoved({
      textChanged: false,
      newBufferPosition: new Point(1, 1),
    });
    await openResult;
    expect(atom.workspace.open).toHaveBeenCalled();
    expect(preview.isAlive()).toBeFalsy();
    expect(atom.workspace.getTextEditors()).not.toEqual([preview]);
    const [editor] = atom.workspace.getTextEditors();
    expect(editor).not.toEqual(preview);
    expect(editor.getPath()).toEqual("/notes/foo.md");
  });
});
