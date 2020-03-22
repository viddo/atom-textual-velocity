/* @flow */

import * as A from "../actions";

import type { Action } from "../actions";
import type { FileReadFails } from "../../flow-types/File";
import type { LoadingState } from "../../flow-types/Loading";
import type { Notes } from "../../flow-types/Note";

const defaults = {
  status: "readDir",
  filesCount: 0,
};

export default function loadingReducer(
  state: LoadingState = defaults,
  action: Action,
  notes: Notes,
  fileReadFails: FileReadFails
) {
  switch (state.status) {
    case "readDir":
      switch (action.type) {
        case A.FILE_FOUND:
          return {
            status: "readDir",
            filesCount: state.filesCount + 1,
          };

        case A.READ_DIR_DONE:
          return state.filesCount === 0
            ? { status: "done" }
            : {
                status: "readingFiles",
                readyCount: readyCount(notes, fileReadFails),
                totalCount: Object.keys(notes).length,
              };

        default:
          return state;
      }

    case "readingFiles":
      switch (action.type) {
        case A.FILE_READ:
        case A.FILE_READ_FAILED:
          return {
            ...state,
            readyCount: readyCount(notes, fileReadFails),
          };

        case A.READ_FILES_DONE:
          return { status: "done" };

        default:
          return state;
      }

    default:
      return state;
  }
}

function readyCount(notes, fileReadFails) {
  return Object.keys(notes).reduce((memo, filename) => {
    const note = notes[filename];
    const fails = fileReadFails[filename];
    if (fails) {
      return memo + 1;
    } else {
      return note.ready ? memo + 1 : memo;
    }
  }, 0);
}
