/* @flow */

import * as C from "./constants";
import NVtags from "./NVtags";
import NVtagsNoteField from "./NVtags/NVtagsNoteField";
import ContentNotefield from "./note-fields/ContentNoteField";
import StatsDateNoteField from "./note-fields/StatsDateNoteField";
import ParsedPathNoteField from "./note-fields/ParsedPathNoteField";
import type { INoteField } from "./flow-types/INoteField";

const noteFields: INoteField[] = [
  new ContentNotefield(),
  new ParsedPathNoteField({
    notePropName: C.NAME_FIELD,
    parsedPathPropName: "name"
  }),
  new ParsedPathNoteField({
    notePropName: C.EXT_FIELD,
    parsedPathPropName: "ext"
  }),
  new StatsDateNoteField({
    notePropName: C.LAST_UPDATE_FIELD,
    statsPropName: "mtime"
  }),
  new StatsDateNoteField({
    notePropName: C.BIRTHTIME_FIELD,
    statsPropName: "birthtime"
  })
];

if (!NVtags.unsupportedError) {
  noteFields.push(new NVtagsNoteField());
}

export default noteFields;

export function patchNoteFieldsForTest(...replacements: Function[]) {
  let original: any;

  beforeEach(() => {
    original = noteFields.slice(0);
    noteFields.length = 0;
    replacements.forEach(fn => {
      const fakeNoteField = fn();
      noteFields.push(fakeNoteField);
    });
  });

  afterEach(() => {
    noteFields.length = 0;
    original.forEach(x => noteFields.push(x));
    original = null;
  });
}
