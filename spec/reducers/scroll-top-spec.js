/* @flow */

import * as A from "../../lib/action-creators";
import scrollTopReducer from "../../lib/reducers/scroll-top";

describe("reducers/scroll-top", () => {
  let state: any;
  let nextListHeight: number;
  let nextRowHeight: number;
  let nextSelectedNote: ?SelectedNote;

  beforeEach(function() {
    state = undefined;
    nextListHeight = 100;
    nextRowHeight = 20;
    nextSelectedNote = null;
  });

  describe("when search", function() {
    beforeEach(function() {
      state = scrollTopReducer(
        state,
        A.search("abc"),
        nextListHeight,
        nextRowHeight,
        nextSelectedNote
      );
    });

    it("should force scrollTop to top", function() {
      expect(state).toEqual(0);
    });
  });

  describe("when reset search", function() {
    beforeEach(function() {
      state = scrollTopReducer(
        state,
        A.resetSearch(),
        nextListHeight,
        nextRowHeight,
        nextSelectedNote
      );
    });

    it("should force scrollTop to top", function() {
      expect(state).toEqual(0);
    });
  });

  describe("when select next", function() {
    sharedAdjustScrollTopSpecs(A.selectNext());
  });

  describe("when select prev", function() {
    sharedAdjustScrollTopSpecs(A.selectPrev());
  });

  describe("when active path changes", function() {
    beforeEach(function() {
      nextSelectedNote = { index: 5, filename: "alice.txt" };
    });

    sharedAdjustScrollTopSpecs(A.changedActivePaneItem("alice.txt"));
  });

  describe("when any other action", function() {
    beforeEach(function() {
      state = 123;
      state = scrollTopReducer(
        state,
        A.startInitialScan(),
        nextListHeight,
        nextRowHeight,
        nextSelectedNote
      );
    });

    it("should return current scrollTop", function() {
      expect(state).toEqual(123);
    });
  });

  function sharedAdjustScrollTopSpecs(action: Action) {
    describe("when there is no selection", function() {
      beforeEach(function() {
        nextSelectedNote = null;
        state = 5;
        state = scrollTopReducer(
          state,
          action,
          nextListHeight,
          nextRowHeight,
          nextSelectedNote
        );
      });

      it("should return current scrollTop", function() {
        expect(state).toEqual(5);
      });
    });

    describe("when selected item is within the viewport", function() {
      beforeEach(function() {
        nextSelectedNote = { index: 5, filename: "alice.txt" };
        state = 25;
        state = scrollTopReducer(
          state,
          action,
          nextListHeight,
          nextRowHeight,
          nextSelectedNote
        );
      });

      it("should return current scrollTop", function() {
        expect(state).toEqual(25);
      });
    });

    describe("when selected item is before the viewport", function() {
      beforeEach(function() {
        nextSelectedNote = { index: 1, filename: "alice.txt" };
        state = 25;
        state = scrollTopReducer(
          state,
          action,
          nextListHeight,
          nextRowHeight,
          nextSelectedNote
        );
      });

      it("should force scrollTop to have the selected item in view at top", function() {
        expect(state).toEqual(20);
      });
    });

    describe("when selected item is after the viewport", function() {
      beforeEach(function() {
        nextSelectedNote = { index: 20, filename: "alice.txt" };
        state = scrollTopReducer(
          state,
          action,
          nextListHeight,
          nextRowHeight,
          nextSelectedNote
        );
      });

      it("should force scrollTop to have the selected item at the bottom of the viewport", function() {
        expect(state).toEqual(320); // 400 - 80 (the height of the other items before the selected)
      });
    });

    describe("when selected item is only half visible at the end of the viewport", function() {
      beforeEach(function() {
        state = 5;
        nextSelectedNote = { index: 5, filename: "alice.txt" };
        state = scrollTopReducer(
          state,
          action,
          nextListHeight,
          nextRowHeight,
          nextSelectedNote
        );
      });

      it("should force scrollTop to have the selected item at the bottom of the viewport", function() {
        expect(state).toEqual(20);
      });
    });

    describe("when selected item is only half visible at the top of the viewport", function() {
      beforeEach(function() {
        state = 25;
        nextSelectedNote = { index: 1, filename: "alice.txt" };
        state = scrollTopReducer(
          state,
          action,
          nextListHeight,
          nextRowHeight,
          nextSelectedNote
        );
      });

      it("should force scrollTop to have the selected item at the top of the viewport", function() {
        expect(state).toEqual(20);
      });
    });
  }
});
