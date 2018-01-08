/* @flow */

import Sifter from "sifter";
import * as A from "../actions";
import type { Action } from "../actions";
import type { Notes } from "../flow-types/Note";
import type { INoteFields } from "../flow-types/INoteFields";
import type { SifterResult } from "../flow-types/SifterResult";

export default function newSifterResultReducer(noteFields: INoteFields) {
  const sifter: Sifter<Notes> = new Sifter();

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
    let sort = state.options.sort && state.options.sort[0];
    if (!sort) {
      sort = secondarySort;
    }

    return sifter.search(query, {
      fields: noteFields.map(noteField => noteField.notePropName),
      sort: [
        {
          field: field || sort.field,
          direction: direction || sort.direction
        },
        secondarySort
      ],
      conjunction: "and"
    });
  };
}
