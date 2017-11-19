/* @flow */

import Sifter from "sifter";
import * as C from "../action-constants";

export default function newSifterResultReducer(noteFields: NoteFields) {
  const sifter = new Sifter();

  const secondarySort = { field: "$score", direction: "desc" };
  const defaults = {
    items: [],
    options: {
      fields: [],
      sort: [secondarySort]
    },
    query: "",
    tokens: [],
    total: 0
  };

  return function sifterResultReducer(
    state: SifterResult = defaults,
    action: Action,
    nextNotes: Notes
  ) {
    let query, direction, field;

    switch (action.type) {
      case C.SEARCH:
        query = action.query;
        break;

      case C.FILE_ADDED:
      case C.FILE_CHANGED:
      case C.FILE_DELETED:
      case C.FILE_READ:
      case C.FILE_RENAMED:
        break;

      case C.CHANGED_SORT_FIELD:
        field = action.sortField;
        break;

      case C.CHANGED_SORT_DIRECTION:
        direction = action.sortDirection;
        break;

      case C.RESET_SEARCH:
      case C.INITIAL_SCAN_DONE:
        query = "";
        break;

      default:
        return state;
    }

    sifter.items = nextNotes; // use notes as items to be search
    query = query !== undefined ? query : state.query;

    return sifter.search(query, {
      fields: noteFields.map(noteField => noteField.notePropName),
      sort: [
        {
          field: field || state.options.sort[0].field,
          direction: direction || state.options.sort[0].direction
        },
        secondarySort
      ],
      conjunction: "and"
    });
  };
}
