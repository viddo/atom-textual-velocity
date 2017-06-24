"use babel";

import StatsDateColumn from "../../lib/columns/stats-date-column";

describe("columns/stats-date-column", function() {
  let column;

  beforeEach(function() {
    column = new StatsDateColumn({
      sortField: "created-date",
      title: "Created date",
      notePropName: "birthtime"
    });
  });

  describe(".sortField", function() {
    it("should return sort field", function() {
      expect(column.sortField).toEqual("created-date");
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
        ext: ".md"
      };
    });

    it("should return an empty string if there is no date for given prop", function() {
      expect(column.cellContent({ note: note, path: path })).toEqual("");
    });

    it("should return diffing time from now", function() {
      note.stats = { birthtime: new Date() };
      expect(column.cellContent({ note: note, path: path })).toEqual(
        jasmine.any(String)
      );
      expect(column.cellContent({ note: note, path: path })).not.toEqual("");
    });
  });
});
