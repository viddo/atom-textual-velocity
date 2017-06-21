# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/) and [keepachangelog.com](http://keepachangelog.com/).

## [unreleased]

## [0.15.0] - 2017-06-20
#### Fixed
- error in init.coffee file in recommended usage [#76](https://github.com/viddo/atom-textual-velocity/issues/76)

#### Added
- Implement @copy syntax for quickly getting a string onto the clipboard [#74](https://github.com/viddo/atom-textual-velocity/pull/74)

## [0.14.2] - 2017-06-07
#### Fixed
- key bindings on linux #[#73](https://github.com/viddo/atom-textual-velocity/issues/73)

## [0.14.1] - 2017-05-19
#### Changed
- Updated dependencies to latest versions

#### Fixed
- Fix Previews unwanted note [#69](https://github.com/viddo/atom-textual-velocity/issues/69)

## [0.14.0] - 2017-04-11
#### Added
- Toggling of columns visibility [#5](https://github.com/viddo/atom-textual-velocity/issues/5)

#### Changed
- Updated dependencies to latest versions [#68](https://github.com/viddo/atom-textual-velocity/issues/68)

## [0.13.0] - 2017-03-29
#### Changed
- Replaced [react-for-atom](https://github.com/facebooknuclide/react-for-atom) with standard react lib [#63](https://github.com/viddo/atom-textual-velocity/issues/63)
- Updated other dependencies to latest versions [#63](https://github.com/viddo/atom-textual-velocity/issues/63)

#### Fixed
- Fix Inability to create notes, use custom folders, validate path before usage [#65](https://github.com/viddo/atom-textual-velocity/issues/65)

## [0.12.4] - 2017-03-08
#### Fixed
- File icons ellipsed on some window sizes [#54](https://github.com/viddo/atom-textual-velocity/issues/54)

## [0.12.3] - 2017-03-08
#### Changed
- Updated dependencies to latest versions

#### Fixed
- Search input always lowercase text [#60](https://github.com/viddo/atom-textual-velocity/issues/60)

## [0.12.2] - 2017-03-05
#### Fixed
- Select next/prev does not always select the expected note [#56](https://github.com/viddo/atom-textual-velocity/issues/56)

## [0.12.1] - 2017-03-03
#### Fixed
- Umlaut characters not matching summary title (filenames) [#55](https://github.com/viddo/atom-textual-velocity/issues/55)

## [0.12.0] - 2017-02-02
#### Added
- Asynchronous initial scan of files
  - Number of files found indicated and updated continuously on initial scan, replacing the generic spinner
  - Fixes the issue of Atom being mostly unresponsive while scanning for files
  - Also fixed the rare case of a path containing "many files" causing Atom to actually freeze - no other reports of it, though

#### Changed
- :truck: Internal code overhaul
  - Migrated away from the ["VIP" architecture](http://clean-swift.com/clean-swift-ios-architecture/)+[BaconJS streams](http://baconjs.github.io/) to a more "contemporary" architecture consisting of [React](https://facebook.github.io/react/)+[Redux](redux.js.org)+[observables](https://redux-observable.js.org)
  - Code feels much "better" now and easier to maintain, which should make it easier for people to understand the code base and contribute :rocket:
-  :arrow_up: Updated all dependencies to latest stable verisons

#### Fixed
- Key down/up on empty list not throwing errors

#### Removed
- Now unused dependencies (lodash.debounce, baconjs)

## [0.11.4] - 2016-12-31
#### Changed
- Updated dependencies, fixed some flowtype complaints due to changes in new version

#### Fixed
- File icons not working since file-icons v2 release [#49](https://github.com/viddo/atom-textual-velocity/issues/49)
- Rows not having consistent height

## [0.11.2] - 2016-12-05
#### Fixed
- Regression from previous fix #45, preventing new note from being created on <kbd>enter</kbd>

## [0.11.1] - 2016-12-04
#### Fixed
- Replace preview with text editor when clicked (related to previous change [#43](https://github.com/viddo/atom-textual-velocity/issues/43))

## [0.11.0] - 2016-11-19
#### Changed
- Improve preview behavior on selection and open action [#43](https://github.com/viddo/atom-textual-velocity/issues/43)

## [0.10.2] - 2016-10-20
#### Fixed
- Fix saving a new note causes the preview of last selected item to open [#41](https://github.com/viddo/atom-textual-velocity/issues/41)

## [0.10.1] - 2016-10-14
#### Fixed
- Fix note rename throwing error _Uncaught TypeError: Cannot read property 'replace' of undefined_ [#37](https://github.com/viddo/atom-textual-velocity/issues/37)
- Register rename-note command for atom-workspace scope

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
