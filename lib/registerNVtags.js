/* @flow */

import NVtags from "./NVtags";
import * as C from "./constants";
import type { IColumns } from "./flow-types/IColumns";
import type { Note } from "./flow-types/Note";

export default function registerNVtags(columns: IColumns) {
  if (NVtags.unsupportedError) return;

  columns.add({
    title: "NV tags",
    description: "NV Tags",
    className: "nv-tags",
    position: 2, // after Summary
    sortField: C.NV_TAGS_FIELD_NAME,
    editCellName: C.NV_TAGS_FILE_PROP_NAME,
    width: 20,

    editCellStr: function(note: Note) {
      var tags = note[C.NV_TAGS_FILE_PROP_NAME] || [];
      return tags.join(" ");
    },

    cellContent: function(params) {
      var tags = params.note[C.NV_TAGS_FILE_PROP_NAME];
      if (Array.isArray(tags)) {
        var searchMatch = params.searchMatch;
        return tags.map(function(tag) {
          return {
            attrs: { className: "inline-block-tight highlight" },
            content: (searchMatch && searchMatch.content(tag)) || tag
          };
        });
      }
    }
  });
}
