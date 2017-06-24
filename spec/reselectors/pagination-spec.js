/* @flow */

import paginationSelector from "../../lib/reselectors/pagination";

describe("reselectors/pagination", () => {
  let state: State;
  let pagination: Pagination;

  beforeEach(function() {
    state = {
      columnHeaders: [],
      dir: "",
      editCellName: null,
      initialScan: {
        done: false,
        rawFiles: []
      },
      listHeight: 1000,
      notes: {},
      queryOriginal: "",
      rowHeight: 24,
      scrollTop: 0,
      selectedNote: null,
      sifterResult: {
        items: [],
        options: {
          fields: [],
          sort: [
            { field: "name", direction: "asc" },
            { field: "$score", direction: "desc" }
          ]
        },
        query: "",
        tokens: [],
        total: 0
      }
    };
  });

  it("should update pagination according to state", function() {
    pagination = paginationSelector(state);
    expect(pagination.start).toEqual(0);
    expect(pagination.limit).toEqual(43); // 41 +2 for visible padding

    state = { ...state, scrollTop: 50 };
    pagination = paginationSelector(state);
    expect(pagination.start).toEqual(2); // 2,5, rounded down
    expect(pagination.limit).toEqual(43); // 41 +2 for visible padding

    state = { ...state, listHeight: 100 };
    pagination = paginationSelector(state);
    expect(pagination.start).toEqual(2); // 2,5, rounded down
    expect(pagination.limit).toEqual(6); // 4.1 rounded down +2 for visible padding

    state = { ...state, rowHeight: 20 };
    pagination = paginationSelector(state);
    expect(pagination.start).toEqual(2); // 2,5, rounded down
    expect(pagination.limit).toEqual(7); // 5 +2 for visible padding
  });
});
