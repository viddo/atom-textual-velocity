/* @flow */

import NVtags from "./NVtags";
import { NV_TAGS_FILE_PROP_NAME } from "./constants";
import type { IColumns } from "./flow-types/IColumns";
import type { INoteFields } from "./flow-types/INoteFields";
import type { Note } from "./flow-types/Note";

export default function registerNVtags(
  columns: IColumns,
  noteFields: INoteFields
) {
  if (NVtags.unsupportedError) return;

  var FIELD_NAME = "nvtagstr";

  noteFields.add({
    notePropName: FIELD_NAME,

    value: function(note: Note) {
      var tags = note[NV_TAGS_FILE_PROP_NAME];
      if (Array.isArray(tags)) {
        return tags.join(" ");
      }
    }
  });

  columns.add({
    title: "NV tags",
    description: "NV Tags",
    className: "nv-tags",
    position: 2, // after Summary
    sortField: FIELD_NAME,
    editCellName: NV_TAGS_FILE_PROP_NAME,
    width: 20,

    editCellStr: function(note: Note) {
      var tags = note[NV_TAGS_FILE_PROP_NAME] || [];
      return tags.join(" ");
    },

    cellContent: function(params) {
      var tags = params.note[NV_TAGS_FILE_PROP_NAME];
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
