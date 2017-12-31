/* @flow */

import StatsDateField from "../../lib/fields/stats-date-field";

describe("fields/stats-date-field", function() {
  let field;

  describe(".notePropName", function() {
    it("should return given name", function() {
      field = new StatsDateField({
        notePropName: "a-name",
        statsPropName: "birthtime"
      });
      expect(field.notePropName).toEqual("a-name");
    });
  });

  describe(".value", function() {
    let actual: any;

    it("should return the value of the given prop path", function() {
      field = new StatsDateField({
        notePropName: "a-name",
        statsPropName: "birthtime"
      });
      const note = {
        id: "",
        name: "",
        ext: "",
        stats: {
          birthtime: new Date()
        }
      };
      if (field.value) {
        actual = field.value(note, "filename");
      }
      expect(actual).toEqual(jasmine.any(Number));

      if (field.value) {
        note.stats = {
          birthtime: undefined
        };
        actual = field.value(note, "filename");
      }
      expect(actual).toBeUndefined();

      field = new StatsDateField({
        notePropName: "a-name",
        statsPropName: "other"
      });
      if (field.value) {
        note.stats = {
          birthtime: new Date()
        };
        actual = field.value(note, "filename");
      }
      expect(actual).toBeUndefined();
    });
  });
});
