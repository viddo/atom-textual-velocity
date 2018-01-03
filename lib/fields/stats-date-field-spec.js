/* @flow */

import statsMock from "../stats-mock";
import StatsDateField from "./stats-date-field";

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
        stats: statsMock({ birthtime: new Date() })
      };
      if (field.value) {
        actual = field.value(note, "filename");
      }
      expect(actual).toEqual(jasmine.any(Number));

      // $FlowFixMe incomplete stats, to verify undefined actual below
      note.stats = {};
      if (field.value) {
        actual = field.value(note, "filename");
      }
      expect(actual).toBeUndefined();

      field = new StatsDateField({
        notePropName: "a-name",
        statsPropName: "other"
      });
      note.stats = statsMock({ birthtime: new Date() });
      if (field.value) {
        actual = field.value(note, "filename");
      }
      expect(actual).toBeUndefined();
    });
  });
});
