/* @flow */

import { Point, Range } from "atom";
import type { PreviewEditor } from "./flow-types/PreviewEditor";

export const PREVIEW_SCHEMA_PREFIX = "tv://";
const fullRange = new Range(Point.ZERO, Point.INFINITY);

const previewEditor = (): PreviewEditor => {
  const editor: PreviewEditor = (atom.workspace.buildTextEditor({
    readOnly: true
  }): any);
  let previewPath = "";

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

  // Some overrides of the default text editor behavior for the purpose of being a reusable preview
  editor.getTitle = () => "Textual Velocity Preview";
  editor.getLongTitle = () =>
    "Textual Velocity Preview - " + editor.getFileName();
  // avoid console.warn of recent-files-fuzzy-finder (due to overriding getPath)
  editor.getPath = editor.getURI = () => previewPath;
  editor.setPath = (notePath: string) => {
    previewPath = PREVIEW_SCHEMA_PREFIX + notePath;
  };
  editor.isModified = () => false; // don't indicate changes to UI

  editor.openPreview = (
    notePath: string,
    content: ?string,
    searchRegexps: RegExp[]
  ) => {
    // setPath must be called before setText so the state is what's expected in the onDidChangeCursorPosition,
    // which is triggered on setText
    editor.setPath(notePath);

    const oldText = editor.getText();
    editor.setText(content || "", { bypassReadOnly: true });
    if (searchRegexps.length && oldText !== editor.getText()) {
      destroyMarkers();
      searchRegexps.forEach(regex => {
        editor.scanInBufferRange(regex, fullRange, ({ range }) => {
          const marker = highlightMarkerLayer.markBufferRange(range);
          highlightMarkers.push(marker);
        });
      });
    }

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
        const notePath = previewPath.slice(PREVIEW_SCHEMA_PREFIX.length);
        await atom.workspace.open(notePath, {
          initialLine: event.newBufferPosition.row,
          initialColumn: event.newBufferPosition.column
        });
        editor.destroy();
      }
    }
  );
  const onDidDestroy = editor.onDidDestroy(() => {
    destroyMarkers();
    highlightMarkerLayer.destroy();
    layerDecoration.destroy();
    onDidChangeCursorPosition.dispose();
    onWillInsertText.dispose();
    onDidDestroy.dispose();
    opener.dispose();
  });

  return editor;
};

export default previewEditor;
