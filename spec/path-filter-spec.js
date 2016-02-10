'use babel'

import Path from 'path'
import PathFilter from '../lib/path-filter'

describe('path-filter', () => {
  let pathFilter

  beforeEach(function () {
    pathFilter = new PathFilter(__dirname)
  })

  it('returns true for any text file', function () {
    expect(pathFilter.isFileAccepted(Path.join(__dirname, 'file.txt'))).toBe(true)
    expect(pathFilter.isFileAccepted(Path.join(__dirname, 'file.md'))).toBe(true)
    expect(pathFilter.isFileAccepted(Path.join(__dirname, 'file.js'))).toBe(true)
    expect(pathFilter.isFileAccepted(Path.join(__dirname, 'file.json'))).toBe(true)
    expect(pathFilter.isFileAccepted(Path.join(__dirname, 'file.bash'))).toBe(true)
  })

  it('returns false for any non-text file', function () {
    expect(pathFilter.isFileAccepted(Path.join(__dirname, 'file.exe'))).toBe(false)
    expect(pathFilter.isFileAccepted(Path.join(__dirname, 'file.jpg'))).toBe(false)
    expect(pathFilter.isFileAccepted(Path.join(__dirname, 'file.zip'))).toBe(false)
    expect(pathFilter.isFileAccepted(Path.join(__dirname, 'file.pdf'))).toBe(false)
  })

  it('returns false for any excluded file', function () {
    expect(pathFilter.isFileAccepted(Path.join(__dirname, '.git/index'))).toBe(false)
    expect(pathFilter.isFileAccepted(Path.join(__dirname, '.DS_Store'))).toBe(false)
  })
})
