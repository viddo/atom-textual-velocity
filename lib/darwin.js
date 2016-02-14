'use babel'

import bplist from 'bplist'
import xattr from 'fs-xattr'

const NOTATIONAL_TAGS_XATTR_KEY = 'com.apple.metadata:kMDItemOMUserTags'

export function getTags (path, nodeCallback) {
  let plistBuf
  try {
    plistBuf = xattr.getSync(path, NOTATIONAL_TAGS_XATTR_KEY)
  } catch (err) {
    // e.g. extended attr does not exist
    return
  }
  bplist.parseBuffer(plistBuf, nodeCallback)
}

export function setTags (path, tags) {
  var plistBuf = bplist.create([tags])
  try {
    xattr.setSync(path, NOTATIONAL_TAGS_XATTR_KEY, plistBuf)
  } catch (err) {
    // e.g. lacking permissions
  }
}
