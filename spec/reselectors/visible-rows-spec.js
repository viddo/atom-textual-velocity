/* @flow */

import Columns from "../../lib/columns";
import FileIconColumn from "../../lib/columns/file-icon-column";
import SummaryColumn from "../../lib/columns/summary-column";
import makeVisibleRowsSelector from "../../lib/reselectors/visible-rows";
import paginationSelector from "../../lib/reselectors/pagination";

describe("reselectors/visible-rows", () => {
  let state: State;
  let visibleRows: Array<Row>;
  let visibleRowsSelector;

  beforeEach(function() {
    const columns = new Columns();
    columns.add(new SummaryColumn({ sortField: "name", editCellName: "" }));
    columns.add(new FileIconColumn({ sortField: "ext" }));

    state = {
      columnHeaders: [],
      dir: "/notes",
      editCellName: null,
      initialScan: {
        done: false,
        rawFiles: []
      },
      listHeight: 25,
      notes: {
        "alice.txt": {
          id: "0",
          ext: "txt",
          name: "alice",
          path: "/notes/alice.txt",
          stats: { mtime: new Date() }
        },
        "bob.md": {
          id: "1",
          ext: "md",
          name: "bob",
          path: "/notes/bob.md",
          stats: { mtime: new Date() }
        },
        "cesar.txt": {
          id: "2",
          ext: "txt",
          name: "cesar",
          path: "/notes/cesar.txt",
          stats: { mtime: new Date() }
        },
        "david.md": {
          id: "3",
          ext: "md",
          name: "david",
          path: "/notes/david.md",
          stats: { mtime: new Date() }
        },
        "eric.txt": {
          id: "4",
          ext: "txt",
          name: "eric",
          path: "/notes/eric.txt",
          stats: { mtime: new Date() }
        }
      },
      queryOriginal: "",
      rowHeight: 25,
      scrollTop: 0,
      selectedNote: null,
      sifterResult: {
        items: [
          { id: "alice.txt", score: 1.0 },
          { id: "bob.md", score: 0.9 },
          { id: "cesar.txt", score: 0.9 },
          { id: "david.md", score: 0.8 },
          { id: "eric.txt", score: 0.7 }
        ],
        options: {
          fields: ["name", "ext"],
          sort: [
            { field: "name", direction: "asc" },
            { field: "$score", direction: "desc" }
          ]
        },
        query: "",
        tokens: [],
        total: 5
      }
    };

    visibleRowsSelector = makeVisibleRowsSelector(columns, paginationSelector);
  });

  describe("when initial scan is done", function() {
    beforeEach(function() {
      visibleRows = visibleRowsSelector(state);
    });

    it("should return paginated rows", function() {
      expect(visibleRows).toEqual(jasmine.any(Array));
      expect(visibleRows.map(x => x.id)).toEqual(["0", "1", "2"]);
      expect(visibleRows.map(x => x.filename)).toEqual([
        "alice.txt",
        "bob.md",
        "cesar.txt"
      ]);
      expect(visibleRows.map(x => x.cells)).toEqual(jasmine.any(Array));
    });
  });

  describe("when have search", function() {
    beforeEach(function() {
      state.queryOriginal = "A"; // matches Alice, cesAr, dAvid
      state.sifterResult.query = "a";
      state.sifterResult.items = [
        { id: "alice.txt", score: 0.1 },
        { id: "cesar.txt", score: 0.1 },
        { id: "david.md", score: 0.1 }
      ];
      visibleRows = visibleRowsSelector(state);
    });

    it("should return paginated rows", function() {
      expect(visibleRows).toEqual(jasmine.any(Array));
      expect(visibleRows.map(x => x.id)).toEqual(["0", "2", "3"]);
      expect(visibleRows.map(x => x.filename)).toEqual([
        "alice.txt",
        "cesar.txt",
        "david.md"
      ]);
      expect(visibleRows.map(x => x.cells)).toEqual(jasmine.any(Array));
    });
  });

  describe("when scrolled", function() {
    beforeEach(function() {
      state.scrollTop = 25;
      visibleRows = visibleRowsSelector(state);
    });

    it("should return paginated rows", function() {
      expect(visibleRows).toEqual(jasmine.any(Array));
      expect(visibleRows.map(x => x.id)).toEqual(["1", "2", "3"]);
      expect(visibleRows.map(x => x.filename)).toEqual([
        "bob.md",
        "cesar.txt",
        "david.md"
      ]);
      expect(visibleRows.map(x => x.cells)).toEqual(jasmine.any(Array));
    });
  });

  describe("when changed list height", function() {
    beforeEach(function() {
      state.listHeight = 1001;
      visibleRows = visibleRowsSelector(state);
    });

    it("should return paginated rows", function() {
      expect(visibleRows).toEqual(jasmine.any(Array));
      expect(visibleRows.map(x => x.id)).toEqual(["0", "1", "2", "3", "4"]);
      expect(visibleRows.map(x => x.filename)).toEqual([
        "alice.txt",
        "bob.md",
        "cesar.txt",
        "david.md",
        "eric.txt"
      ]);
      expect(visibleRows.map(x => x.cells)).toEqual(jasmine.any(Array));
    });
  });

  describe("when changed row height", function() {
    beforeEach(function() {
      state.rowHeight = 12;
      visibleRows = visibleRowsSelector(state);
    });

    it("should return paginated rows", function() {
      expect(visibleRows).toEqual(jasmine.any(Array));
      expect(visibleRows.map(x => x.id)).toEqual(["0", "1", "2", "3"]);
      expect(visibleRows.map(x => x.filename)).toEqual([
        "alice.txt",
        "bob.md",
        "cesar.txt",
        "david.md"
      ]);
      expect(visibleRows.map(x => x.cells)).toEqual(jasmine.any(Array));
    });
  });

  describe("when changed sort direction", function() {
    beforeEach(function() {
      state.sifterResult.options.sort[0].direction = "desc";
      state.sifterResult.items = state.sifterResult.items.reverse();
      visibleRows = visibleRowsSelector(state);
    });

    it("should return paginated rows", function() {
      expect(visibleRows).toEqual(jasmine.any(Array));
      expect(visibleRows.map(x => x.id)).toEqual(["4", "3", "2"]);
      expect(visibleRows.map(x => x.filename)).toEqual([
        "eric.txt",
        "david.md",
        "cesar.txt"
      ]);
      expect(visibleRows.map(x => x.cells)).toEqual(jasmine.any(Array));
    });
  });

  describe("when changed sort field", function() {
    beforeEach(function() {
      state.sifterResult.options.sort[0].field = "ext";
      state.sifterResult.items = state.sifterResult.items.sort(
        (a: any, b: any) => {
          a = a.id.split(".")[1];
          b = b.id.split(".")[1];
          if (a < b) return -1;
          if (a > b) return 1;
          return 0; // equal
        }
      );
      visibleRows = visibleRowsSelector(state);
    });

    it("should return paginated rows", function() {
      expect(visibleRows).toEqual(jasmine.any(Array));
      expect(visibleRows.map(x => x.id)).toEqual(["1", "3", "0"]);
      expect(visibleRows.map(x => x.filename)).toEqual([
        "bob.md",
        "david.md",
        "alice.txt"
      ]);
      expect(visibleRows.map(x => x.cells)).toEqual(jasmine.any(Array));
    });
  });
});
