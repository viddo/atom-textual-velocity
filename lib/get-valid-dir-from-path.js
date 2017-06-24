/* @flow */

import Path from "path";
import fs from "fs-plus";

export default function validatePath(path: string) {
  path = path.trim();

  if (path === "") {
    return Path.join(atom.configDirPath, "notes");
  }

  path = fs.absolute(path); // e.g. ~/something => /Users/alice/something

  if (!fs.isAbsolute(path)) {
    path = Path.join(fs.getHomeDirectory(), path);
  }

  path = Path.resolve(path); // removes any trailing slash

  // TODO workflow for "faulty" path, e.g. can't read dir etc. should degrade gracefully or hint user how to resolve

  return path;
}
