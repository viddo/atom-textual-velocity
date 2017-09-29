/* @flow */

import Path from "path";
import * as A from "../action-creators";

export default function selectedNoteReducer(
  state: ?SelectedNote = null,
  action: Action,
  dir: string,
  nextSifterResult: SifterResult
) {
  if (nextSifterResult.items.length === 0) return null;

  let filename;
  let index = -1;

  switch (action.type) {
    case A.SEARCH:
    case A.RESET_SEARCH:
      return null;

    case A.CHANGED_ACTIVE_PANE_ITEM:
      if (!action.path) return null;
      filename = action.path.replace(dir + Path.sep, "");
      return getSelectedNote(nextSifterResult, filename);

    case A.CLICK_ROW:
      return getSelectedNote(nextSifterResult, action.filename);

    case A.CHANGED_SORT_FIELD:
    case A.CHANGED_SORT_DIRECTION:
      return getSelectedNote(nextSifterResult, state && state.filename);

    case A.SELECT_NEXT:
      index = findIndex(nextSifterResult, state && state.filename);
      index =
        index === -1
          ? 0 // start at beginning of list
          : Math.min(index + 1, nextSifterResult.items.length - 1); // next -or- stop at end of list
      return { index, filename: nextSifterResult.items[index].id };

    case A.SELECT_PREV:
      index = findIndex(nextSifterResult, state && state.filename);
      index =
        index === -1
          ? nextSifterResult.items.length - 1 // start at end of list
          : Math.max(index - 1, 0); // prev -or- stop at beginning of list
      return { index, filename: nextSifterResult.items[index].id };

    case A.FILE_DELETED:
      return state && state.filename === action.filename ? null : state;

    case A.FILE_ADDED:
      return getSelectedNote(nextSifterResult, action.rawFile.filename);

    default:
      return state;
  }
}

function getSelectedNote(sifterResult: SifterResult, filename: ?string) {
  const index = findIndex(sifterResult, filename);
  return filename && index >= 0 ? { filename, index } : null;
}

function findIndex(sifterResult: SifterResult, filename: ?string) {
  return filename
    ? sifterResult.items.findIndex(item => item.id === filename)
    : -1;
}
