# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/) and [keepachangelog.com](http://keepachangelog.com/).

## [unreleased]
### Added
- Rename note, by double-click a note or keyboard shortcut (`cmd+r` when focused on search)
- Service API draft for easier integration, see [nvTags](lib/service-consumers/nv-tags.js) for example usage

### Changed
- Internals completely refactored, primarily to make changes and new features easier to implement+test
- Updated all dependencies to latest stable versions
- Extracted file icons to a column of its own

### Fixed
- #9 Upgrading chokidar to v1.6.0
- #20 Do not load nvTags if the platform doesn't support the necessary dependencies

## [0.7.0] - 2016-03-29
### Added
- Add ability to change sorting and direction #2
- Close preview when item is deselected

### Changed
- Open preview editor as pending editor/tab (requires Atom 1.6.0)

### Fixed
- Fix click on tags component doesn't open edit input

## [0.5.1] - 2016-03-06
### Fixed
- Custom file extension only works if <= 3 characters

## [0.5.0] - 2016-02-28
### Added
- Update selected item according to active pane too

### Changed
- Internal structure

## [0.4.0] - 2016-02-18
### Added
- Read/write of tags, using notational.net compatible metadata (stored in xattrs)

### Fixed
- Confirm-save dialog appears even if there are no changes
- #12 .md is always added when new files are created

## [0.3.0] - 2016-02-10
### Changed
- Load notes from `.atom/notes` dir by default, with the option to override with a custom path
- Renamed class names to avoid capital characters, e.g. `textVelocity` => `textual-velocity`
- Docs; simplify and clarify intentions and usage.

### Removed
- Unnecessary path filter, can be solved w/o implementation (e.g. .gitignore or similar)

### Fixed
- Use correct config key paths
- Create a new untitled file on enter when there's no search string

## [0.2.4] - 2016-02-08
### Added
- Better project description and reference to v1 roadmap milestone

## [0.2.3] - 2016-02-07
### Added
- Some minimal documentation on how it's intended to be used

## [0.2.2] - 2016-02-06
### Added
- Pointer cursor on items, to indicate that they're clickable

### Changed
- Internal structure, file/class names etc.

### Fixed
- Reset search on `<ESC>`
- Do not open new file on enter unless there is at least one char in the search input

## [0.1.2] - 2016-02-05
### Changed
- Command name `textual-velocity` => `textual-velocity`

### Fixed
- `<enter>` with selected file focus on selected file instead of opening new buffer

## [0.1.0] - 2016-02-04
- [M{D,L}P](https://twitter.com/jopas/status/515301088660959233)
- Just works™ with some known limitations
