/* @flow */

import StatsDateColumn from "../../lib/columns/StatsDateColumn";
import statsMock from "../statsMock";

describe("columns/StatsDateColumn", function() {
  let column;

  beforeEach(function() {
    column = new StatsDateColumn({
      description: "",
      sortField: "mtime",
      title: "Created date",
      notePropName: "birthtime"
    });
  });

  describe(".sortField", function() {
    it("should return sort field", function() {
      expect(column.sortField).toEqual("mtime");
    });
  });

  describe(".title", function() {
    it("should return title", function() {
      expect(column.title).toEqual("Created date");
    });
  });

  describe(".cellContent", function() {
    let path, note;

    beforeEach(function() {
      path = "/notes/markdown.md";
      note = {
        id: "",
        name: "markdown",
        ext: ".md",
        stats: {}
      };
    });

    it("should return an empty string if there is no date for given prop", function() {
      const params = { note, path };
      // $FlowFixMe note.stats is invalid, which we want to test for here
      const actual = column.cellContent(params);
      expect(actual).toEqual("");
    });

    it("should return diffing time from now", function() {
      note.stats = statsMock({ birthtime: new Date() });
      expect(column.cellContent({ note: note, path: path })).toEqual(
        jasmine.any(String)
      );
      expect(column.cellContent({ note: note, path: path })).not.toEqual("");
    });
  });
});
