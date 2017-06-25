/* @flow */

import Columns from "../lib/columns";

describe("columns", () => {
  let columns, schema;

  beforeEach(function() {
    atom.config.setSchema("textual-velocity.sortField", {
      type: "string",
      default: "name"
    });
    atom.config.set("textual-velocity.sortField", "name");

    columns = new Columns();
    columns.add({
      cellContent: () => "some content",
      description: "A test column",
      sortField: "test-field",
      title: "test",
      width: 25
    });
    columns.add({
      cellContent: () => "name",
      description: "Filename w/o extension",
      sortField: "name",
      title: "Name",
      width: 50
    });
    columns.add({
      cellContent: () => "ext",
      description: "extension of filename",
      sortField: "ext",
      title: "File extension",
      width: 25
    });
    schema = atom.config.getSchema("textual-velocity.sortField");
  });

  it("should change the schema", function() {
    expect(schema.type).toEqual("string");
    expect(schema.default).toEqual("test-field");
    expect(schema.enum).toEqual([
      { value: "test-field", description: "test" },
      { value: "name", description: "Name" },
      { value: "ext", description: "File extension" }
    ]);
  });

  it("should maintain config value even after columns are added/schema changed", function() {
    expect(atom.config.get("textual-velocity.sortField")).toEqual("name");
  });

  describe(".map", function() {
    it("should map results", function() {
      expect(columns.map(column => column.sortField)).toEqual([
        "test-field",
        "name",
        "ext"
      ]);
    });
  });
});
