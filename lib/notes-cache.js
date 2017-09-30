/* @flow */

import Disposables from "./disposables";

const CACHE_VERSION = 1;
const CUSTOM_STATE_KEY = ["textual-velocity"];

const privates = new WeakMap();

/**
 * Utilize Atom's existing atom.stateStore object to cache notes globally instead of just for current Atom session
 * https://github.com/atom/atom/blob/ef6b3646050261fd71452b870cc0065befe9cfcb/src/atom-environment.coffee#L141
 */
export default class NotesCache {
  constructor(dir: string) {
    const disposables = new Disposables(
      atom.commands.add(
        "atom-workspace",
        "textual-velocity:clear-notes-cache",
        () => {
          privates.set(this, {
            ...privates.get(this),
            skipSave: true
          });

          atom.notifications.addSuccess("Textual Velocity", {
            description:
              "Notes cache cleared! Will take effect when the session is restarted or notes path is changed.",
            dismissable: true
          });
        }
      )
    );

    privates.set(this, {
      dir,
      disposables,
      skipSave: false
    });
  }

  dispose() {
    const { disposables } = privates.get(this) || {};
    disposables.dispose();
    privates.delete(this);
  }

  load(): Promise<Notes> {
    const { dir } = privates.get(this) || {};

    return new Promise((resolve, reject) => {
      const fallback = {};
      if (!atom.enablePersistence) resolve(fallback);

      return atom.stateStore
        .load(atom.getStateKey(CUSTOM_STATE_KEY))
        .then(state => {
          const notes: Notes =
            (state && state[CACHE_VERSION] && state[CACHE_VERSION][dir]) ||
            fallback;
          resolve(notes);
        })
        .catch(err => {
          console.warn("textual-velocity: could not load cached notes:", err);
          resolve({});
        });
    });
  }

  save(notes: Notes): Promise<Error> {
    if (!atom.enablePersistence) {
      return new Promise((resolve, reject) => {
        reject(new Error("atom.enablePersistence is set to false"));
      });
    }

    const { dir, skipSave } = privates.get(this) || {};

    let state = {};
    if (!skipSave) {
      state = {
        [CACHE_VERSION]: {
          [dir]: notes
        }
      };
    }

    return atom.stateStore
      .save(atom.getStateKey(CUSTOM_STATE_KEY), state)
      .catch(err => {
        console.warn("textual-velocity: could not save notes cache:", err);
      });
  }
}
