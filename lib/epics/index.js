/* @flow */
import { combineEpics } from "redux-observable";

import activePaneItemEpic from "./activePaneItemEpic";
import atCopyMatchToClipboardEpic from "./atCopyMatchToClipboardEpic";
import configChangesEpic from "./configChangesEpic";
import fileReadsEpic from "./fileReadsEpic";
import focusOnSearchWhenClosingLastEditorEpic from "./focusOnSearchWhenClosingLastEditorEpic";
import hiddenColumnsEpic from "./hiddenColumnsEpic";
import pathWatcherEpic from "./pathWatcherEpic";
import previewNoteEpic from "./previewNoteEpic";
import readDirEpic from "./readDirEpic";
import renameNoteEpic from "./renameNoteEpic";
import writeNVtagsEpic from "./writeNVtagsEpic";

export default combineEpics(
  activePaneItemEpic,
  atCopyMatchToClipboardEpic,
  configChangesEpic,
  fileReadsEpic,
  focusOnSearchWhenClosingLastEditorEpic,
  hiddenColumnsEpic,
  pathWatcherEpic,
  previewNoteEpic,
  readDirEpic,
  renameNoteEpic,
  writeNVtagsEpic
);
