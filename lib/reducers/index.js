/* @flow */

import fileReadFailsReducer from "./fileReadFailsReducer";
import listHeightReducer from "./listHeightReducer";
import loadingReducer from "./loadingReducer";
import columnHeadersReducer from "./columnHeadersReducer";
import editCellNameReducer from "./editCellNameReducer";
import notesReducer from "./notesReducer";
import sifterResultReducer from "./sifterResultReducer";
import queryOriginalReducer from "./queryOriginalReducer";
import rowHeightReducer from "./rowHeightReducer";
import scrollTopReducer from "./scrollTopReducer";
import selectedNoteReducer from "./selectedNoteReducer";

import type { Action } from "../actions";
import type { State } from "../../flow-types/State";

export default function rootReducer(state: State | void, action: Action) {
  if (!state) state = ({}: any); // just to be compliant with createStore
  const fileReadFails = fileReadFailsReducer(state.fileReadFails, action);
  const notes = notesReducer(state.notes, action);
  const sifterResult = sifterResultReducer(state.sifterResult, action, notes);
  const listHeight = listHeightReducer(state.listHeight, action);
  const rowHeight = rowHeightReducer(state.rowHeight, action);
  const selectedNote = selectedNoteReducer(
    state.selectedNote,
    action,
    sifterResult
  );
  const scrollTop = scrollTopReducer(
    state.scrollTop,
    action,
    listHeight,
    rowHeight,
    selectedNote
  );

  return {
    columnHeaders: columnHeadersReducer(state.columnHeaders, action),
    dir: state.dir,
    editCellName: editCellNameReducer(state.editCellName, action),
    fileReadFails,
    listHeight,
    loading: loadingReducer(state.loading, action, notes, fileReadFails),
    notes,
    queryOriginal: queryOriginalReducer(state.queryOriginal, action),
    rowHeight,
    scrollTop,
    selectedNote,
    sifterResult,
  };
}
