/* @flow */

import { combineEpics, createEpicMiddleware } from "redux-observable";
import NotesFileFilter from "../notes-file-filter";
import activePaneItem from "./active-pane-item";
import atCopyMatchToClipboardEpic from "./at-copy-match-to-clipboard";
import configChanges from "./config-changes";
import makeFileReads from "./file-reads";
import makeFileWrites from "./file-writes";
import makeHiddenColumns from "./hidden-columns";
import makeInitialScan from "./initial-scan";
import makePathWatcher from "./path-watcher";
import previewNote from "./preview-note";

export default function makeEpicMiddleware(
  dir: string,
  columns: Columns,
  fileReaders: FileReaders,
  fileWriters: FileWriters
) {
  const fileReads = makeFileReads(fileReaders);
  const fileWrites = makeFileWrites(fileWriters);
  const hiddenColumns = makeHiddenColumns(columns);

  const notesFileFilter = new NotesFileFilter(dir, {
    exclusions: atom.config.get("textual-velocity.ignoredNames"),
    excludeVcsIgnoredPaths: atom.config.get(
      "textual-velocity.excludeVcsIgnoredPaths"
    )
  });
  const initialScan = makeInitialScan(notesFileFilter);
  const pathWatcher = makePathWatcher(notesFileFilter);

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
