/* @flow */

import { createSelector } from "reselect";

const getListHeight = (state: State) => state.listHeight;
const getRowHeight = (state: State) => state.rowHeight;
const getScrollTop = (state: State) => state.scrollTop;

const VISIBLE_PADDING = 2;

export default createSelector(
  getListHeight,
  getRowHeight,
  getScrollTop,
  (listHeight: number, rowHeight: number, scrollTop: number) => {
    return {
      start: (scrollTop / rowHeight) | 0,
      limit: ((listHeight / rowHeight) | 0) + VISIBLE_PADDING
    };
  }
);
