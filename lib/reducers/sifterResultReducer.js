/* @flow */

import Sifter from "sifter";
import * as A from "../actions";
import noteFields from "../NoteFields";

import type { Action } from "../actions";
import type { Notes } from "../../flow-types/Note";
import type { SifterResult } from "../../flow-types/SifterResult";

const sifter: Sifter<Notes> = new Sifter();

const DEFAULT_SORT = { field: "$score", direction: "desc" };
const defaults = {
  items: [],
  options: {
    fields: [],
    sort: [DEFAULT_SORT]
  },
  query: "",
  tokens: [],
  total: 0
};

export default function sifterResultReducer(
  state: SifterResult = defaults,
  action: Action,
  nextNotes: Notes
) {
  let query = state.query,
    direction,
    field;

  switch (action.type) {
    case A.SEARCH:
      query = action.query;
      break;

    case A.FILE_ADDED:
    case A.FILE_CHANGED:
    case A.FILE_DELETED:
    case A.FILE_READ:
    case A.FILE_RENAMED:
      // These actions do not modify the query, but should trigger a new search for the results to match changed state
      break;

    case A.CHANGED_SORT_FIELD:
      field = action.sortField;
      break;

    case A.CHANGED_SORT_DIRECTION:
      direction = action.sortDirection;
      break;

    case A.RESET_SEARCH:
    case A.READ_DIR_DONE:
      query = "";
      break;

    default:
      return state;
  }

  sifter.items = nextNotes; // use notes as items to be search
  let lastSort = state.options.sort && state.options.sort[0];

  return sifter.search(query, {
    fields: noteFields.map(noteField => noteField.notePropName),
    sort: lastSort
      ? [
          {
            field: field || lastSort.field,
            direction: direction || lastSort.direction
          },
          DEFAULT_SORT
        ]
      : [DEFAULT_SORT],
    conjunction: "and"
  });
}
