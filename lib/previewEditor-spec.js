/* @flow */

import previewEditor from "./previewEditor";
import { it } from "./async-spec-helpers";

describe("previewEditor", function() {
  it("should behave as expected", async function() {
    let preview = previewEditor();
    await preview.openPreview("/notes/foo.md", "bar", null);
    expect(preview.getPath()).not.toEqual("/notes/foo.md");
    expect(preview.getPath()).toContain("/notes/foo.md");
    expect(preview.getURI()).toEqual(preview.getPath());
    expect(preview.getLongTitle()).toContain("foo");
    expect(preview.getText()).toEqual("bar");
    expect(preview.isModified()).toBeFalsy();
    expect(preview.isAlive()).toBeTruthy();
    expect(atom.workspace.getTextEditors()).toEqual([preview]);
    preview.destroy();
    expect(preview.isAlive()).toBeFalsy();

    // test creating a new editor and call multiple timees, should not have any duplicates
    preview = previewEditor();
    preview.openPreview("/notes/foo.md", "bar", null);
    const content = "baz\nqux\ntrololol";
    await preview.openPreview("/notes/bar.md", content, null);
    expect(preview.getPath()).toContain("/notes/bar.md");
    expect(preview.getURI()).toEqual(preview.getPath());
    expect(preview.getLongTitle()).toContain("bar");
    expect(preview.getText()).toEqual(content);
    expect(preview.isModified()).toBeFalsy();
    expect(atom.workspace.getTextEditors()).toEqual([preview]);

    // test cursor change
    let openResult;
    const originalOpen = atom.workspace.open;
    spyOn(atom.workspace, "open").andCallFake((...args) => {
      openResult = originalOpen.apply(atom.workspace, args);
      return originalOpen;
    });
    preview.cursorMoved({
      textChanged: true,
      newBufferPosition: { row: 0, column: 0 }
    });
    expect(atom.workspace.open).not.toHaveBeenCalled();
    preview.cursorMoved({
      textChanged: false,
      newBufferPosition: { row: 1, column: 1 }
    });
    await openResult;
    // should destroy preview and open normal editor in its place
    expect(atom.workspace.open).toHaveBeenCalled();
    expect(preview.isAlive()).toBeFalsy();
    expect(atom.workspace.getTextEditors()).not.toEqual([preview]);
    const [editor] = atom.workspace.getTextEditors();
    expect(editor).not.toEqual(preview);
    expect(editor.getPath()).toEqual("/notes/bar.md");
  });
});
