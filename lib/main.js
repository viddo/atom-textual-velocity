/* @flow */

import Disposables from "./disposables";
import Columns from "./columns";
import FileReaders from "./file-readers";
import FileWriters from "./file-writers";
import NoteFields from "./note-fields";
import Service from "./service";
import Session from "./session";
import nvTags from "./service-consumers/nv-tags";
import renameNote from "./service-consumers/rename-note";
import defaults from "./service-consumers/defaults";
import { defaultConfig } from "./config";
import FileIconsReader from "./file-readers/file-icons-reader";
import getValidDirFromPath from "./get-valid-dir-from-path";

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
    defaults.consumeService(service, RENAME_CELL_NAME),
    renameNote.consumeService(service, RENAME_CELL_NAME),
    nvTags.consumeService(service)
  );

  startSession();
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

export function provideService() {
  return service;
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
      startSessionCmd = atom.commands.add(
        "atom-workspace",
        "textual-velocity:start-session",
        startSession
      );
    }
  });
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
