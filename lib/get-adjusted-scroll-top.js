/* @flow */

// Adjust scrollTop for selected file
export default function (params: {
  scrollTop: number,
  rowHeight: number,
  visibleHeight: number,
  selectedIndex: number | void
}): number {
  const {scrollTop, rowHeight, visibleHeight} = params

  if (Number.isInteger(params.selectedIndex)) {
    const selectedScrollTop = parseInt(params.selectedIndex) * rowHeight

    if (scrollTop + visibleHeight < selectedScrollTop + rowHeight) {
      // selected file X is located after the visible bounds
      // from: ..[...]..X..
      // to:   ......[..X].
      return selectedScrollTop + rowHeight - visibleHeight
    } else if (scrollTop > selectedScrollTop) {
      // selected file X is located before the visible bounds
      // from: ..X..[...]..
      // to:   .[X..]......
      return selectedScrollTop
    }
  }

  return scrollTop // either there is no selection or it's within bounds, either way just return current scrollTop value
}
