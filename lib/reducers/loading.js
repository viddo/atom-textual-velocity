/* @flow */

import * as A from "../action-creators";

const defaults = {
  status: "initialScan",
  filesCount: 0
};

export default function loadingReducer(
  state: LoadingState = defaults,
  action: Action,
  notes: Notes
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
                readyCount: readyCount(notes),
                totalCount: Object.keys(notes).length
              };

        default:
          return state;
      }

    case "readingFiles":
      switch (action.type) {
        case A.FILE_READ:
          return {
            ...state,
            readyCount: readyCount(notes)
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

function readyCount(notes) {
  return Object.keys(notes).reduce((memo, filename) => {
    return notes[filename].ready ? memo + 1 : memo;
  }, 0);
}
