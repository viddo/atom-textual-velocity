'use babel'

// // Adjust scrollTop for selected file
export default function ({scrollTop, selectedIndex, rowHeight, panelHeight}) {
  const selectedScrollTop = selectedIndex * rowHeight
  if (scrollTop + panelHeight < selectedScrollTop + rowHeight) {
    // selected file X is located after the visible bounds
    // from: ..[...]..X..
    // to:   ......[..X].
    return selectedScrollTop + rowHeight - panelHeight
  } else if (scrollTop > selectedScrollTop) {
    // selected file X is located before the visible bounds
    // from: ..X..[...]..
    // to:   .[X..]......
    return selectedScrollTop
  } else {
    // selected file is located within the visible bounds, just return the current scrollTop value
    return scrollTop
  }
}
