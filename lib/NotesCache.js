/* @flow */

import BSON from "bson";
import fs from "fs";
import path from "path";
import Disposables from "./Disposables";
import { showWarningNotification } from "./showWarningNotification";

import type { Notes } from "../flow-types/Note";

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
      .catch(() => {});

    const cachePath = path.join(this._dir, CACHE_FILENAME);
    try {
      return fs.existsSync(cachePath)
        ? BSON.deserialize(fs.readFileSync(cachePath))
        : {};
    } catch (error) {
      showWarningNotification("Failed to load notes cache", error);
      return {};
    }
  }

  save(notes: Notes) {
    const cachePath = path.join(this._dir, CACHE_FILENAME);

    if (this._skipSave) {
      try {
        fs.unlinkSync(cachePath);
      } catch (err) {
        console.warn("textual-velocity: could not clear notes cache:", err);
      }
    } else {
      try {
        const data = BSON.serialize(notes);
        fs.writeFileSync(cachePath, data);
      } catch (err) {
        console.warn("textual-velocity: could not cache notes:", err);
      }
    }
  }
}
