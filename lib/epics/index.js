/* @flow */
import { combineEpics } from "redux-observable";

import activePaneItemEpic from "./activePaneItemEpic";
import atCopyMatchToClipboardEpic from "./atCopyMatchToClipboardEpic";
import configChangesEpic from "./configChangesEpic";
import fileReadsEpic from "./fileReadsEpic";
import fileWritesEpic from "./fileWritesEpic";
import focusOnSearchWhenClosingLastEditorEpic from "./focusOnSearchWhenClosingLastEditorEpic";
import hiddenColumnsEpic from "./hiddenColumnsEpic";
import pathWatcherEpic from "./pathWatcherEpic";
import previewNoteEpic from "./previewNoteEpic";
import readDirEpic from "./readDirEpic";

export default combineEpics(
  activePaneItemEpic,
  atCopyMatchToClipboardEpic,
  configChangesEpic,
  fileReadsEpic,
  fileWritesEpic,
  focusOnSearchWhenClosingLastEditorEpic,
  hiddenColumnsEpic,
  pathWatcherEpic,
  previewNoteEpic,
  readDirEpic
);
