/* @flow */

import NoteFields from "../lib/note-fields";

describe("note-fields", () => {
  let noteFields;

  beforeEach(function() {
    noteFields = new NoteFields();
  });

  describe(".forEach", function() {
    let testNoteField;

    beforeEach(function() {
      testNoteField = {
        notePropName: "test",
        value: (note, filename) => filename.split(".").slice(-1)[0]
      };
      noteFields.add(testNoteField);
      noteFields.add({ notePropName: "content" }); // fields that only is there to indicate the existance of the field doesn't need a value transformer
    });

    it("should iterate each note field", function() {
      const tmp = [];
      noteFields.forEach(noteField => {
        tmp.push(noteField);
      });
      expect(tmp[0]).toEqual(testNoteField);
    });
  });

  describe(".map", function() {
    beforeEach(function() {
      noteFields.add({
        notePropName: "test",
        value: (note, filename) => filename.split(".").slice(-1)[0]
      });
      noteFields.add({ notePropName: "content" }); // fields that only is there to indicate the existance of the field doesn't need a value transformer
    });

    it("should return map values", function() {
      expect(noteFields.map(noteField => noteField.notePropName)).toEqual([
        "test",
        "content"
      ]);
    });
  });
});
