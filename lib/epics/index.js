/* @flow */

import { combineEpics, createEpicMiddleware } from "redux-observable";
import activePaneItem from "./active-pane-item";
import atCopyMatchToClipboardEpic from "./at-copy-match-to-clipboard";
import configChanges from "./config-changes";
import initialScan from "./initial-scan";
import makeFileReads from "./file-reads";
import makeFileWrites from "./file-writes";
import makeHiddenColumns from "./hidden-columns";
import pathWatcher from "./path-watcher";
import previewNote from "./preview-note";

export default function makeEpicMiddleware(
  columns: Columns,
  fileReaders: FileReaders,
  fileWriters: FileWriters
) {
  const fileReads = makeFileReads(fileReaders);
  const fileWrites = makeFileWrites(fileWriters);
  const hiddenColumns = makeHiddenColumns(columns);

  return createEpicMiddleware(
    combineEpics(
      activePaneItem,
      atCopyMatchToClipboardEpic,
      configChanges,
      fileReads,
      fileWrites,
      hiddenColumns,
      initialScan,
      pathWatcher,
      previewNote
    )
  );
}
