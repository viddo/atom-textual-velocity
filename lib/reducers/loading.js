/* @flow */

import * as A from "../action-creators";

const defaults = {
  status: "initialScan",
  filesCount: 0
};

export default function loadingReducer(
  state: LoadingState = defaults,
  action: Action,
  notes: Notes,
  fileReadFails: FileReadFails
) {
  switch (state.status) {
    case "initialScan":
      switch (action.type) {
        case A.FILE_FOUND:
          return {
            status: "initialScan",
            filesCount: state.filesCount + 1
          };

        case A.INITIAL_SCAN_DONE:
          return state.filesCount === 0
            ? { status: "done" }
            : {
                status: "readingFiles",
                readyCount: readyCount(notes, fileReadFails),
                totalCount: Object.keys(notes).length
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
            readyCount: readyCount(notes, fileReadFails)
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
