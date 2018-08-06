/* @flow */

import statsMock from "../statsMock";
import StatsDateNoteField from "../../lib/note-fields/StatsDateNoteField";

describe("fields/StatsDateNoteField", function() {
  let field;

  describe(".notePropName", function() {
    it("should return given name", function() {
      field = new StatsDateNoteField({
        notePropName: "name",
        statsPropName: "birthtime"
      });
      expect(field.notePropName).toEqual("name");
    });
  });

  describe(".value", function() {
    let actual: any;

    it("should return the value of the given prop path", function() {
      field = new StatsDateNoteField({
        notePropName: "name",
        statsPropName: "birthtime"
      });
      const note = {
        id: "",
        name: "",
        ext: "",
        stats: statsMock({ birthtime: new Date() })
      };
      actual = undefined;
      if (field.value) {
        actual = field.value(note);
      }
      expect(actual).toEqual(jasmine.any(Number));

      // assert last update
      // $FlowFixMe incomplete stats, to verify undefined actual below
      note.stats = {};
      actual = undefined;
      if (field.value) {
        actual = field.value(note);
      }
      expect(actual).toBeUndefined();

      field = new StatsDateNoteField({
        notePropName: "name",
        statsPropName: "mtime"
      });
      note.stats = statsMock({ birthtime: new Date() });
      actual = undefined;
      if (field.value) {
        actual = field.value(note);
      }
      expect(actual).toEqual(jasmine.any(Number));
    });
  });
});
