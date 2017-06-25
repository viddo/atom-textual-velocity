/* @flow */

import Sifter from "sifter";
import * as A from "../action-creators";

export default function makeSifterResultReducer(noteFields: NoteFields) {
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
      case A.SEARCH:
        query = action.query;
        break;

      case A.FILE_ADDED:
      case A.FILE_CHANGED:
      case A.FILE_DELETED:
      case A.FILE_READ:
        break;

      case A.CHANGED_SORT_FIELD:
        field = action.sortField;
        break;

      case A.CHANGED_SORT_DIRECTION:
        direction = action.sortDirection;
        break;

      case A.RESET_SEARCH:
      case A.INITIAL_SCAN_DONE:
      case A.INITIAL_SCAN_RAW_FILES_READ:
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
