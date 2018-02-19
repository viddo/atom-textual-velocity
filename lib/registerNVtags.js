/* @flow */

import fs from "fs";
import NVtags from "./NVtags";
import type { IColumns } from "./flow-types/IColumns";
import type { IFileReaders } from "./flow-types/IFileReaders";
import type { INoteFields } from "./flow-types/INoteFields";
import type { Note } from "./flow-types/Note";
import type { NodeCallback } from "./flow-types/NodeCallback";

export const FILE_PROP_NAME = "nvtags";

export default function registerNVtags(
  columns: IColumns,
  fileReaders: IFileReaders,
  noteFields: INoteFields
) {
  if (NVtags.unsupportedError) return;

  var FIELD_NAME = "nvtagstr";

  fileReaders.add({
    notePropName: FILE_PROP_NAME,

    read: function(path: string, stats: fs.Stats, callback: NodeCallback) {
      NVtags.read(path, callback);
    }
  });

  noteFields.add({
    notePropName: FIELD_NAME,

    value: function(note: Note) {
      var tags = note[FILE_PROP_NAME];
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
    editCellName: FILE_PROP_NAME,
    width: 20,

    editCellStr: function(note: Note) {
      var tags = note[FILE_PROP_NAME] || [];
      return tags.join(" ");
    },

    cellContent: function(params) {
      var tags = params.note[FILE_PROP_NAME];
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
