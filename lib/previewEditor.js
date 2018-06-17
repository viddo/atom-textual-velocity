/* @flow */

import type { PreviewEditor } from "./flow-types/PreviewEditor";

export const PREVIEW_SCHEMA_PREFIX = "tv://";

const previewEditor = (): PreviewEditor => {
  const editor: PreviewEditor = (atom.workspace.buildTextEditor({
    readOnly: true
  }): any);
  let previewPath = "";

  // Some overrides of the default text editor behavior for the purpose of being a reusable preview
  editor.getTitle = () => "Textual Velocity Preview";
  editor.getLongTitle = () =>
    "Textual Velocity Preview - " + editor.getFileName();
  editor.getPath = () => previewPath;
  editor.getURI = () => previewPath; // avoid console.warn of recent-files-fuzzy-finder (due to overriding getPath)
  editor.setPath = () => {}; // path is set through editor.show instead (see below)
  editor.isModified = () => false; // don't indicate changes to UI

  editor.openPreview = (
    notePath: string,
    content: ?string,
    searchRegex?: ?RegExp
  ) => {
    previewPath = PREVIEW_SCHEMA_PREFIX + notePath;

    editor.setPath(previewPath);
    // setPath must be called before setText so the state is what's expected in the onDidChangeCursorPosition,
    // which is triggered on setText
    editor.setText(content || "", { bypassReadOnly: true });

    return atom.workspace.open(previewPath, {
      activatePane: false,
      searchAllPanes: true
    });
  };

  const opener = atom.workspace.addOpener(uri => {
    if (uri.startsWith(PREVIEW_SCHEMA_PREFIX)) {
      return editor;
    }
  });

  // prevent user inserts from ever happening
  const onWillInsertText = editor.onWillInsertText(event => {
    event.cancel();
  });

  const onDidChangeCursorPosition = editor.onDidChangeCursorPosition(
    async (event: any) => {
      if (!event.textChanged) {
        // if the cursor is changed without any text change it's because the user did some interaction
        // in that case open a normal text editor in the same place
        const previewPath = editor.getPath();
        if (previewPath) {
          const notePath = previewPath.slice(PREVIEW_SCHEMA_PREFIX.length);
          await atom.workspace.open(notePath, {
            initialLine: event.newBufferPosition.row,
            initialColumn: event.newBufferPosition.column
          });
          editor.destroy();
        }
      }
    }
  );
  const onDidDestroy = editor.onDidDestroy(() => {
    opener.dispose();
    onDidChangeCursorPosition.dispose();
    onWillInsertText.dispose();
    onDidDestroy.dispose();
  });

  return editor;
};

export default previewEditor;
