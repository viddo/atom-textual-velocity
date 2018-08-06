/* @flow */

import ParsedPathNoteField from "../../lib/note-fields/ParsedPathNoteField";

describe("fields/ParsedPathNoteField", function() {
  let field;

  beforeEach(function() {
    field = new ParsedPathNoteField({
      notePropName: "name",
      parsedPathPropName: "name"
    });
  });

  describe(".notePropName", function() {
    it("should return given name", function() {
      expect(field.notePropName).toEqual("name");
    });
  });

  describe(".value", function() {
    let note: any, actual: any;

    it("should return the normalized parsed path piece", function() {
      if (field.value) {
        actual = field.value(note, "snowflake.md");
      }
      expect(actual).toEqual("snowflake");
    });

    it("should normalize unicode codepoints to match keyboard input", function() {
      if (field.value) {
        actual = field.value(note, "\u0061\u0308lg.md");
      }
      expect(actual).toEqual("älg");
    });
  });
});
