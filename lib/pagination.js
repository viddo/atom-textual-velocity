/* @flow */

const VISIBLE_PADDING = 2

export function start (params: {scrollTop: number, rowHeight: number}): number {
  const {scrollTop, rowHeight} = params
  return (scrollTop / rowHeight) | 0
}

export function limit (params: {listHeight: number, rowHeight: number}): number {
  const {listHeight, rowHeight} = params
  return ((listHeight / rowHeight) | 0) + VISIBLE_PADDING
}
