/* @flow */

import Disposables from "./Disposables";
import Columns from "./Columns";
import FileReaders from "./FileReaders";
import FileWriters from "./FileWriters";
import NoteFields from "./NoteFields";
import Service from "./Service";
import Session from "./Session";
import NVTags from "./service-consumers/NVTags";
import RenameNote from "./service-consumers/RenameNote";
import Defaults from "./service-consumers/Defaults";
import { defaultConfig } from "./config";
import FileIconsReader from "./file-readers/FileIconsReader";
import getValidDirFromPath from "./getValidDirFromPath";
import uiDev from "./uiDev";

const RENAME_CELL_NAME = "rename";

export const config = defaultConfig;

let disposables,
  columns,
  fileReaders,
  fileWriters,
  noteFields,
  service,
  session,
  sessionCmds,
  startSessionCmd;

export function activate() {
  columns = new Columns();
  fileReaders = new FileReaders();
  fileWriters = new FileWriters();
  noteFields = new NoteFields();
  service = new Service(columns, fileReaders, fileWriters, noteFields);

  disposables = new Disposables(
    Defaults.consumeService(service, RENAME_CELL_NAME),
    RenameNote.consumeService(service, RENAME_CELL_NAME),
    NVTags.consumeService(service)
  );

  setupStartSessionCmd();
  setupUiDev();
}

// Integration with https://atom.io/packages/file-icons
export function consumeFileIconsService(fileIconsService: any) {
  const fileIconsReader = new FileIconsReader(fileIconsService);

  if (service) {
    service.registerFileReaders(fileIconsReader);
  }

  return new Disposables(() => {
    if (service) {
      service.deregisterFileReaders(fileIconsReader);
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
  if (service) {
    service.dispose();
    service = null;
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
