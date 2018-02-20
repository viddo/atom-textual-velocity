/* @flow */

import * as C from "../constants";
import type { INoteField } from "../flow-types/INoteField";

export default class ContentNoteField implements INoteField {
  notePropName: string;
}

ContentNoteField.prototype.notePropName = C.CONTENT;
