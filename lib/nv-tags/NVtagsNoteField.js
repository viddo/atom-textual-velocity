/* @flow */

import type { INoteField } from "../../flow-types/INoteField";
import type { Note, NotePropName } from "../../flow-types/Note";

export default class NVtagsNoteField implements INoteField {
  notePropName: NotePropName;

  value(note: Note) {
    var tags = note["nvtags"];
    if (Array.isArray(tags)) {
      return tags.join(" ");
    }
  }
}

NVtagsNoteField.prototype.notePropName = "nvtagstr";
