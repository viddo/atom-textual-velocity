/* @flow */

import BSON from "bson";
import fs from "fs";
import Path from "path";
import Disposables from "./disposables";

export const CACHE_FILENAME = ".textual-velocity-cache";
const LEGACY_CUSTOM_STATE_KEY = ["textual-velocity"];

/**
 * Utilize Atom's existing atom.stateStore object to cache notes globally instead of just for current Atom session
 * https://github.com/atom/atom/blob/ef6b3646050261fd71452b870cc0065befe9cfcb/src/atom-environment.coffee#L141
 */
export default class NotesCache {
  _dir: string;
  _disposables: Disposables;
  _skipSave: boolean;

  constructor(dir: string) {
    this._dir = dir;
    this._disposables = new Disposables(
      atom.commands.add(
        "atom-workspace",
        "textual-velocity:clear-notes-cache",
        () => {
          this._skipSave = true;

          atom.notifications.addSuccess("Textual Velocity", {
            description:
              "Notes cache cleared! Will take effect when the session is restarted or notes path is changed.",
            dismissable: true
          });
        }
      )
    );

    this._skipSave = false;
  }

  dispose() {
    this._disposables.dispose();
  }

  load(): Notes {
    atom.stateStore
      .save(atom.getStateKey(LEGACY_CUSTOM_STATE_KEY), {})
      .catch(err => {});

    const path = Path.join(this._dir, CACHE_FILENAME);
    const bson = new BSON();
    try {
      return bson.deserialize(fs.readFileSync(path));
    } catch (err) {
      console.warn("textual-velocity: could not load cached notes:", err);
      return {};
    }
  }

  save(notes: Notes) {
    const path = Path.join(this._dir, CACHE_FILENAME);

    if (this._skipSave) {
      try {
        fs.unlinkSync(path);
      } catch (err) {
        console.warn("textual-velocity: could not clear notes cache:", err);
      }
    } else {
      const bson = new BSON();
      try {
        const data = bson.serialize(notes);
        fs.writeFileSync(path, data);
      } catch (err) {
        console.warn("textual-velocity: could not cache notes:", err);
      }
    }
  }
}
