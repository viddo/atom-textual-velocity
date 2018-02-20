/* @flow */

import FileIconColumn from "./FileIconColumn";
import statsMock from "../statsMock";

describe("columns/FileIconColumn", function() {
  let column;

  beforeEach(function() {
    column = new FileIconColumn();
  });

  describe(".sortField", function() {
    it("should return given sort field value", function() {
      expect(column.sortField).toEqual("ext");
    });
  });

  describe(".cellContent", function() {
    let note, path, cellContent: any;

    beforeEach(function() {
      path = "/notes/markdown.md";
      note = {
        id: "",
        name: "markdown",
        fileIcons: "",
        ext: ".md",
        stats: statsMock()
      };
      cellContent = column.cellContent({ note, path });
    });

    it("should return a kind of AST from which a DOM can be created", function() {
      expect(cellContent).toEqual(jasmine.any(Object), "title");
      expect(cellContent.attrs).toEqual({
        className: "icon icon-file-text",
        "data-name": "markdown.md"
      });
    });

    describe("when note.fileIcons are available", function() {
      beforeEach(function() {
        note.fileIcons = "icon-file-text medium-blue";
        cellContent = column.cellContent({ note, path });
      });

      it("should utilize file icons instead", function() {
        expect(cellContent).toEqual(jasmine.any(Object), "title");
        expect(cellContent.attrs).toEqual({
          className: "icon-file-text medium-blue",
          "data-name": "markdown.md"
        });
      });
    });
  });
});
