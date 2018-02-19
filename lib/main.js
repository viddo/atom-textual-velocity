/* @flow */

import Disposables from "./Disposables";
import Columns from "./Columns";
import FileReaders from "./FileReaders";
import FileWriters from "./FileWriters";
import NoteFields from "./NoteFields";
import Session from "./Session";
import NVTags from "./NVTags";
import { defaultConfig } from "./config";
import FileIconsReader from "./file-readers/FileIconsReader";
import getValidDirFromPath from "./getValidDirFromPath";
import uiDev from "./uiDev";
import { RENAME_CELL_NAME } from "./epics/renameNoteEpic";
import FileIconColumn from "./columns/FileIconColumn";
import StatsDateColumn from "./columns/StatsDateColumn";
import SummaryColumn from "./columns/SummaryColumn";
import StatsFileReader from "./file-readers/StatsFileReader";
import ContentFileReader from "./file-readers/ContentFileReader";
import StatsDateNoteField from "./note-fields/StatsDateNoteField";
import ParsedPathNoteField from "./note-fields/ParsedPathNoteField";

const NAME_FIELD = "name";
const EXT_FIELD = "ext";
const LAST_UPDATE_FIELD = "lastupdate";
const BIRTHTIME_FIELD = "birthtime";

export const config = defaultConfig;

let disposables,
  columns,
  fileReaders,
  fileWriters,
  noteFields,
  session,
  sessionCmds,
  startSessionCmd;

export function activate() {
  columns = new Columns();
  fileReaders = new FileReaders();
  fileWriters = new FileWriters();
  noteFields = new NoteFields();

  const contentFileReader = new ContentFileReader();
  fileReaders.add(new StatsFileReader(), contentFileReader);

  noteFields.add(
    contentFileReader,
    new ParsedPathNoteField({
      notePropName: NAME_FIELD,
      parsedPathPropName: "name"
    }),
    new ParsedPathNoteField({
      notePropName: EXT_FIELD,
      parsedPathPropName: "ext"
    }),
    new StatsDateNoteField({
      notePropName: LAST_UPDATE_FIELD,
      statsPropName: "mtime"
    }),
    new StatsDateNoteField({
      notePropName: BIRTHTIME_FIELD,
      statsPropName: "birthtime"
    })
  );

  columns.add(
    new FileIconColumn({ sortField: EXT_FIELD }),
    new SummaryColumn({
      sortField: NAME_FIELD,
      editCellName: RENAME_CELL_NAME
    }),
    new StatsDateColumn({
      title: "Last updated",
      description: "Last updated date",
      notePropName: "mtime",
      sortField: LAST_UPDATE_FIELD
    }),
    new StatsDateColumn({
      title: "Created",
      description: "Created date",
      notePropName: "birthtime",
      sortField: BIRTHTIME_FIELD
    })
  );

  disposables = new Disposables(
    NVTags.register(columns, fileReaders, fileWriters, noteFields)
  );

  setupStartSessionCmd();
  setupUiDev();
}

// Integration with https://atom.io/packages/file-icons
export function consumeFileIconsService(fileIconsService: any) {
  const fileIconsReader = new FileIconsReader(fileIconsService);

  if (fileReaders) {
    fileReaders.add(fileIconsReader);
  }

  return new Disposables(() => {
    if (fileReaders) {
      fileReaders.remove(fileIconsReader);
    }
  });
}

export function deactivate() {
  stopSession();
  disposeStartSessionCmd();

  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
  if (columns) {
    columns.dispose();
    columns = null;
  }
  if (fileReaders) {
    fileReaders.dispose();
    fileReaders = null;
  }
  if (fileWriters) {
    fileWriters.dispose();
    fileWriters = null;
  }
  if (noteFields) {
    noteFields.dispose();
    noteFields = null;
  }
}

function startSession() {
  const dir = getValidDirFromPath(atom.config.get("textual-velocity.path"));

  disposeStartSessionCmd();
  if (!columns || !fileReaders || !fileWriters || !noteFields) return;

  session = new Session();
  session.start(dir, columns, fileReaders, fileWriters, noteFields);

  sessionCmds = atom.commands.add("atom-workspace", {
    "textual-velocity:restart-session": () => {
      stopSession();
      startSession();
    },
    "textual-velocity:stop-session": () => {
      stopSession();
      setupStartSessionCmd();
    }
  });
}

function setupStartSessionCmd() {
  startSessionCmd = atom.commands.add(
    "atom-workspace",
    "textual-velocity:start-session",
    startSession
  );
}

function stopSession() {
  if (sessionCmds) {
    sessionCmds.dispose();
    sessionCmds = null;
  }
  if (session) {
    session.dispose();
    session = null;
  }
}

function disposeStartSessionCmd() {
  if (startSessionCmd) {
    startSessionCmd.dispose();
    startSessionCmd = null;
  }
}

function setupUiDev() {
  atom.commands.add("atom-workspace", "textual-velocity:ui-dev", () => {
    if (columns && fileReaders && noteFields) {
      const panel = atom.workspace.addTopPanel({
        item: document.createElement("div")
      });
      uiDev(panel, columns, fileReaders, noteFields);
    }
  });
}
