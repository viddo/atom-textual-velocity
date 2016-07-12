'use babel'

import getAdjustedScrollTop from '../lib/get-adjusted-scroll-top'

describe('getAdjustedScrollTop', function () {
  it('returns current scroll if item is in visible viewport', function () {
    // selected item and scrolltop is at top and within the visible viewport
    expect(getAdjustedScrollTop({
      visibleHeight: 25,
      rowHeight: 25,
      scrollTop: 0,
      selectedIndex: 0
    })).toBe(0)

    // selected item matches what's within the visible viewport
    expect(getAdjustedScrollTop({
      visibleHeight: 25,
      rowHeight: 25,
      scrollTop: 25,
      selectedIndex: 1
    })).toBe(25)

    // selected item is last item in visible viewport
    expect(getAdjustedScrollTop({
      visibleHeight: 75,
      rowHeight: 25,
      scrollTop: 50,
      selectedIndex: 2
    })).toBe(50)
  })

  it('returns a scrollTop value adapted for item located after the visible viewport', function () {
    // selected item X is located after the visible bounds
    // from: ..[...]..X..
    // to:   ......[..X].
    expect(getAdjustedScrollTop({
      visibleHeight: 100,
      rowHeight: 25,
      scrollTop: 1,
      selectedIndex: 4
    })).toBe(25)

    // Still outside by 1px
    expect(getAdjustedScrollTop({
      visibleHeight: 100,
      rowHeight: 25,
      scrollTop: 24,
      selectedIndex: 4
    })).toBe(25)

    // Way out
    expect(getAdjustedScrollTop({
      visibleHeight: 100,
      rowHeight: 25,
      scrollTop: 24,
      selectedIndex: 5
    })).toBe(50)

    // Real example, non-conforming body height
    expect(getAdjustedScrollTop({
      visibleHeight: 68,
      rowHeight: 25,
      scrollTop: 0,
      selectedIndex: 2
    })).toBe(7)
  })

  it('returns a scrollTop value adapted for item located before the visible viewport', function () {
    // selected item X is located before the visible bounds
    // from: ..X..[...]..
    // to:   .[X..]......

    expect(getAdjustedScrollTop({
      visibleHeight: 100,
      rowHeight: 25,
      scrollTop: 29,
      selectedIndex: 1
    })).toBe(25)

    // 1px is still outside
    expect(getAdjustedScrollTop({
      visibleHeight: 100,
      rowHeight: 25,
      scrollTop: 26,
      selectedIndex: 1
    })).toBe(25)

    // Way out
    expect(getAdjustedScrollTop({
      visibleHeight: 100,
      rowHeight: 25,
      scrollTop: 9000,
      selectedIndex: 1
    })).toBe(25)
  })
})
