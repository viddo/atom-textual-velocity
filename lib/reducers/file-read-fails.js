/* @flow */

import * as C from "../action-constants";

export default function fileReadFails(
  state: FileReadFails = {},
  action: Action
) {
  let filename;

  switch (action.type) {
    case C.FILE_READ_FAILED:
      filename = action.filename;
      const existing = state[filename];
      return {
        ...state,
        [filename]: [...new Set([action.notePropName].concat(existing))].filter(
          x => !!x
        )
      };

    case C.FILE_READ:
      filename = action.filename;
      const notePropNames = state[filename];
      if (notePropNames) {
        const { notePropName } = action;
        const newNotePropNames = notePropNames.filter(x => x !== notePropName);
        if (newNotePropNames.length > 0) {
          return {
            ...state,
            [filename]: newNotePropNames
          };
        } else {
          return Object.keys(state).reduce((memo, key) => {
            if (key !== filename) {
              memo[key] = state[key];
            }
            return memo;
          }, {});
        }
      }
      return state;

    default:
      return state;
  }
}
