# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/) and [keepachangelog.com](http://keepachangelog.com/).

## [unreleased]

## [0.10.0] - 2016-10-14
### Added
- Option to exclude certain files from search [#29](https://github.com/viddo/atom-textual-velocity/pull/29)

### Changed
- Use a custom editor for notes preview [#25](https://github.com/viddo/atom-textual-velocity/pull/25)
- Updated dependencies [#36](https://github.com/viddo/atom-textual-velocity/pull/36/commits/8bfe21f7adea39e3384bb2839822b80021d52d6a)

### Fixed
- Notes cache not saved properly [#32](https://github.com/viddo/atom-textual-velocity/pull/32)

## [0.9.0] - 2016-10-07
### Added
- Allow to change default/new file extension [#22](https://github.com/viddo/atom-textual-velocity/pull/22)

### Fixed
- Note stats not being updated on file changes like before [1e55e10](https://github.com/viddo/atom-textual-velocity/commit/1e55e108c5ffcecab99a4c91867bdb2bdd994198)

## [0.8.0] - 2016-10-04
[Happy Cinnamon Bun Day! :tada:](http://kanelbullensdag.se/en/)

### Added
- Rename note, by double-clicking a note or keyboard shortcut (`cmd+r` when focused on search)
- Service API draft for easier integration, see [nvTags](lib/service-consumers/nv-tags.js) for example usage

### Changed
- Internals completely refactored, mainly to make changes and new features easier to implement+test
- Updated all dependencies to latest stable versions
  - Upgrading chokidar to v1.6.0 [#9](https://github.com/viddo/atom-textual-velocity/issues/9)
- Extracted file icons to its own column definition

### Fixed
- Do not load nvTags if the platform doesn't support the necessary dependencies [#20](https://github.com/viddo/atom-textual-velocity/issues/20)
- Performance improvements; The first initial load is incremental, which makes the notes scan somewhat slower but on the other hand the UI is no longer unresponsive during this phase. However, after this initial load is almost instant. [#8](https://github.com/viddo/atom-textual-velocity/issues/8)

## [0.7.0] - 2016-03-29
### Added
- Add ability to change sorting and direction [#2](https://github.com/viddo/atom-textual-velocity/issues/2)
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
- `.md` is always added when new files are created [#12](https://github.com/viddo/atom-textual-velocity/issues/12)

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
- Reset search on <kbd>ESC</kbd>
- Do not open new file on enter unless there is at least one char in the search input

## [0.1.2] - 2016-02-05
### Changed
- Command name `textual-velocity` => `textual-velocity`

### Fixed
- <kbd>ENTER</kbd> with selected file focus on selected file instead of opening new buffer

## [0.1.0] - 2016-02-04
- [M{D,L}P](https://twitter.com/jopas/status/515301088660959233)
- Just works™ with some known limitations
