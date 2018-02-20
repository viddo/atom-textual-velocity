/* @flow */

import * as C from "./constants";
import Disposables from "./Disposables";
import Columns from "./Columns";
import Session from "./Session";
import registerNVtags from "./registerNVtags";
import { defaultConfig } from "./config";
import FileIconsReader from "./file-readers/FileIconsReader";
import getValidDirFromPath from "./getValidDirFromPath";
import uiDev from "./uiDev";
import { RENAME_CELL_NAME } from "./epics/renameNoteEpic";
import FileIconColumn from "./columns/FileIconColumn";
import StatsDateColumn from "./columns/StatsDateColumn";
import SummaryColumn from "./columns/SummaryColumn";

export const config = defaultConfig;

let columns, session, sessionCmds, startSessionCmd;

export function activate() {
  columns = new Columns();
  columns.add(
    new FileIconColumn({ sortField: C.EXT_FIELD }),
    new SummaryColumn({
      sortField: C.NAME_FIELD,
      editCellName: RENAME_CELL_NAME
    }),
    new StatsDateColumn({
      title: "Last updated",
      description: "Last updated date",
      notePropName: "mtime",
      sortField: C.LAST_UPDATE_FIELD
    }),
    new StatsDateColumn({
      title: "Created",
      description: "Created date",
      notePropName: "birthtime",
      sortField: C.BIRTHTIME_FIELD
    })
  );

  registerNVtags(columns);

  setupStartSessionCmd();

  if (atom.inDevMode()) {
    setupUiDev();
  }
}

// Integration with https://atom.io/packages/file-icons
export function consumeFileIconsService(fileIconsService: any) {
  FileIconsReader.setFileIconsService(fileIconsService);

  return new Disposables(() => {
    FileIconsReader.setFileIconsService(null);
  });
}

export function deactivate() {
  stopSession();
  disposeStartSessionCmd();

  if (columns) {
    columns.dispose();
    columns = null;
  }
}

function startSession() {
  const dir = getValidDirFromPath(atom.config.get("textual-velocity.path"));

  disposeStartSessionCmd();
  if (!columns) return;

  session = new Session();
  session.start(dir, columns);

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
    if (columns) {
      const panel = atom.workspace.addTopPanel({
        item: document.createElement("div")
      });
      uiDev(panel, columns);
    }
  });
}
