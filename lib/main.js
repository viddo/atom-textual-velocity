/* @flow */

import Disposables from "./Disposables";
import Session from "./Session";
import { defaultConfig } from "./config";
import FileIconsReader from "./file-readers/FileIconsReader";
import getValidDirFromPath from "./getValidDirFromPath";

export const config = defaultConfig;

let session, sessionCmds, startSessionCmd;

export function activate() {
  setupStartSessionCmd();

  if (atom.inDevMode()) {
    require("./uiDev");
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
}

function startSession() {
  const dir = getValidDirFromPath(atom.config.get("textual-velocity.path"));

  disposeStartSessionCmd();
  session = new Session();
  session.start(dir);

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
