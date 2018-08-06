/* @flow */

import { createSelector } from "reselect";

import type { State } from "../../flow-types/State";

const getListHeight = (state: State) => state.listHeight;
const getRowHeight = (state: State) => state.rowHeight;
const getScrollTop = (state: State) => state.scrollTop;

const VISIBLE_PADDING = 2;

export type Pagination = {
  start: number,
  limit: number
};

export default createSelector(
  getListHeight,
  getRowHeight,
  getScrollTop,
  (listHeight: number, rowHeight: number, scrollTop: number) => {
    const pagination: Pagination = {
      start: (scrollTop / rowHeight) | 0,
      limit: ((listHeight / rowHeight) | 0) + VISIBLE_PADDING
    };
    return pagination;
  }
);
