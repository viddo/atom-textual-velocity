/* @flow */

import type { INoteField } from "../../flow-types/INoteField";
import type { NotePropName } from "../../flow-types/Note";

export default class ContentNoteField implements INoteField {
  notePropName: NotePropName;
}

ContentNoteField.prototype.notePropName = "content";
