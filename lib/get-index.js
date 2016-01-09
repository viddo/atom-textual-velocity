'use babel'

import R from 'ramda'

export function prev (total, current) {
  const prev = R.defaultTo(total, current) - 1
  if (prev <= 0) {
    return 0
  } else if (prev > total) {
    return total - 1
  } else {
    return prev
  }
}

export function next (total, current) {
  const next = R.defaultTo(-1, current) + 1
  if (next >= total) {
    return total - 1
  } else if (next <= 0) {
    return 0
  } else {
    return next
  }
}
