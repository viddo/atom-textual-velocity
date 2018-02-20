/* @flow */

import * as C from "../constants";
import type { INoteField } from "../flow-types/INoteField";
import type { Note } from "../flow-types/Note";

export default class NVtagsNoteField implements INoteField {
  notePropName: string;

  value(note: Note) {
    var tags = note[C.NV_TAGS_FILE_PROP_NAME];
    if (Array.isArray(tags)) {
      return tags.join(" ");
    }
  }
}

NVtagsNoteField.prototype.notePropName = C.NV_TAGS_FIELD_NAME;
