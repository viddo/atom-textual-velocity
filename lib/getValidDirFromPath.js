/* @flow */

import path from "path";
import fs from "fs-plus";

export default function validatePath(notesPath: string) {
  notesPath = notesPath.trim();

  if (notesPath === "") {
    notesPath = path.join(atom.configDirPath, "notes");
  }

  notesPath = fs.absolute(notesPath); // e.g. ~/something => /Users/alice/something

  if (!fs.isAbsolute(notesPath)) {
    notesPath = path.join(fs.getHomeDirectory(), notesPath);
  }

  notesPath = path.resolve(notesPath); // removes any trailing slash

  if (!fs.existsSync(notesPath)) {
    fs.mkdirSync(notesPath, 0o755);
  }

  return notesPath;
}
