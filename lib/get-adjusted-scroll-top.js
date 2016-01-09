'use babel'

// // Adjust scrollTop for selected item
export default function ({scrollTop, selectedIndex, rowHeight, bodyHeight}) {
  const selectedScrollTop = selectedIndex * rowHeight
  if (scrollTop + bodyHeight < selectedScrollTop + rowHeight) {
    // selected item X is located after the visible bounds
    // from: ..[...]..X..
    // to:   ......[..X].
    return selectedScrollTop + rowHeight - bodyHeight
  } else if (scrollTop > selectedScrollTop) {
    // selected item X is located before the visible bounds
    // from: ..X..[...]..
    // to:   .[X..]......
    return selectedScrollTop
  } else {
    // selected item is located within the visible bounds, just return the current scrollTop value
    return scrollTop
  }
}
