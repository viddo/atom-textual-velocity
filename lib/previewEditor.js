/* @flow */

import { Point, Range } from "atom";

import type { PreviewEditor } from "../flow-types/PreviewEditor";

export const PREVIEW_SCHEMA_PREFIX = "tv://";
export const PREVIEW_EDITOR_TITLE = "Textual Velocity Preview";
const FULL_RANGE = new Range(Point.ZERO, Point.INFINITY);

const findFirstRow = (content: string, searchRegexp?: RegExp) => {
  if (searchRegexp) {
    const searchMatch = content.match(searchRegexp);
    if (searchMatch) {
      // $FlowFixMe str.match returns an array according to flow core definitions (v0.78)
      const matchStart = searchMatch.index;
      const newLines = content.slice(0, matchStart).match(/\n/g);
      if (newLines) {
        return newLines.length;
      }
    }
  }

  return 0;
};

const previewEditor = (): PreviewEditor => {
  const editor: PreviewEditor = (atom.workspace.buildTextEditor({
    // autoHeight is necessay for scrolling to work as expected.
    // It's also done internally when opening a new text editor:
    // https://github.com/atom/atom/blob/3e97867f3e3ffd1b04a3b25978a40eb1d377f52f/src/workspace.js#L1266
    autoHeight: false,
    readOnly: true
  }): any);
  let previewPath = "";

  let onDidChangeCursorPosition = null;
  const disposeOnDidChangeCursorPosition = () => {
    if (onDidChangeCursorPosition) {
      onDidChangeCursorPosition.dispose();
      onDidChangeCursorPosition = null;
    }
  };
  const maybeReplaceWithRealEditor = async (event: any) => {
    if (!event.textChanged) {
      // if the cursor is changed without any text change it's because the user did some interaction
      // in that case open a normal text editor in the same place
      const notePath = previewPath.slice(PREVIEW_SCHEMA_PREFIX.length);
      await atom.workspace.open(notePath, {
        initialLine: event.newBufferPosition.row,
        initialColumn: event.newBufferPosition.column
      });
      editor.destroy();
    }
  };

  const highlightMarkerLayer = editor.addMarkerLayer({
    maintainHistory: false
  });
  const highlightMarkers: atom$DisplayMarker[] = [];
  const destroyMarkers = () => {
    highlightMarkers.forEach(marker => {
      marker.destroy();
    });
    highlightMarkers.length = 0;
    highlightMarkerLayer.clear();
  };
  const layerDecoration = editor.decorateMarkerLayer(highlightMarkerLayer, {
    type: "highlight",
    class: "find-result"
  });

  // Some overrides of the default text editor behavior for the purpose of being a reusable preview:
  editor.getTitle = editor.getLongTitle = () => PREVIEW_EDITOR_TITLE;
  editor.getPath = editor.getURI = () => undefined;
  editor.setPath = (notePath: string) => {
    previewPath = PREVIEW_SCHEMA_PREFIX + notePath;
  };
  editor.isModified = () => false; // don't indicate changes to UI
  editor.shouldPromptToSave = () => false;

  // Open a preview; handles necessary state changes and setup/teardowns
  editor.openPreview = async (
    notePath: string,
    content: ?string,
    searchRegexps: RegExp[]
  ) => {
    content = content || "";
    disposeOnDidChangeCursorPosition();

    // setPath must be called before setText so the state is what's expected in the onDidChangeCursorPosition,
    // which is triggered on setText
    editor.setPath(notePath);

    const oldText = editor.getText();
    editor.setText(content, { bypassReadOnly: true });

    // Update markers, if need be
    if (searchRegexps.length && oldText !== editor.getText()) {
      destroyMarkers();
      searchRegexps.forEach(regex => {
        editor.scanInBufferRange(regex, FULL_RANGE, ({ range }) => {
          const marker = highlightMarkerLayer.markBufferRange(range);
          highlightMarkers.push(marker);
        });
      });
    }

    const openPromise = await atom.workspace.open(previewPath, {
      activatePane: false, // to keep focus on search/keyboard navigation
      initialLine: findFirstRow(content, searchRegexps[0]), // scroll to first search match (if any)
      initialColumn: 0,
      searchAllPanes: true // will open existing texteditor (if any)
    });

    onDidChangeCursorPosition = editor.onDidChangeCursorPosition(
      maybeReplaceWithRealEditor
    );

    return openPromise;
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

  const onDidDestroy = editor.onDidDestroy(() => {
    destroyMarkers();
    highlightMarkerLayer.destroy();
    layerDecoration.destroy();
    disposeOnDidChangeCursorPosition();
    onWillInsertText.dispose();
    onDidDestroy.dispose();
    opener.dispose();
  });

  return editor;
};

export default previewEditor;
