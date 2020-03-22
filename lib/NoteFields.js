/* @flow */

import NVtags from "./NVtags";
import NVtagsNoteField from "./nv-tags/NVtagsNoteField";
import ContentNotefield from "./note-fields/ContentNoteField";
import StatsDateNoteField from "./note-fields/StatsDateNoteField";
import ParsedPathNoteField from "./note-fields/ParsedPathNoteField";

import type { INoteField } from "../flow-types/INoteField";

const noteFields: INoteField[] = [
  new ContentNotefield(),
  new ParsedPathNoteField({
    notePropName: "name",
    parsedPathPropName: "name",
  }),
  new ParsedPathNoteField({
    notePropName: "ext",
    parsedPathPropName: "ext",
  }),
  new StatsDateNoteField({
    notePropName: "mtime",
    statsPropName: "mtime",
  }),
  new StatsDateNoteField({
    notePropName: "birthtime",
    statsPropName: "birthtime",
  }),
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
    replacements.forEach((fn) => {
      const fakeNoteField = fn();
      noteFields.push(fakeNoteField);
    });
  });

  afterEach(() => {
    noteFields.length = 0;
    original.forEach((x) => noteFields.push(x));
    original = null;
  });
}
