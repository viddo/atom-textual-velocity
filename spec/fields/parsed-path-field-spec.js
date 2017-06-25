"use babel";

import ParsedPathField from "../../lib/fields/parsed-path-field";

describe("fields/parsed-path-field", function() {
  let field;

  beforeEach(function() {
    field = new ParsedPathField({
      notePropName: "filename",
      parsedPathPropName: "name"
    });
  });

  describe(".notePropName", function() {
    it("should return given name", function() {
      expect(field.notePropName).toEqual("filename");
    });
  });

  describe(".value", function() {
    let note: any;

    it("should return the normalized parsed path piece", function() {
      expect(field.value(note, "snowflake.md")).toEqual("snowflake");
    });

    it("should normalize unicode codepoints to match keyboard input", function() {
      expect(field.value(note, "\u0061\u0308lg.md")).toEqual("älg");
    });
  });
});
