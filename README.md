# Textual Velocity for Atom [![Build Status](http://travis-ci.org/viddo/atom-textual-velocity.png?branch=master)](http://travis-ci.org/viddo/atom-textual-velocity)
_Note that this package is still WIP, see [v1 roadmap milestone](https://github.com/viddo/atom-textual-velocity/milestones) for details.  See the [change log](CHANGELOG.md) for what's new._

Your mental notes at your fingertips!

For those of you who used [Notational Velocity](http://notational.net/) or [nvalt](http://brettterpstra.com/projects/nvAlt/) before should feel right at home.

<img width="748" alt="screen shot 2016-02-04 at 20 05 58" src="https://cloud.githubusercontent.com/assets/978461/12831123/f48a5964-cb92-11e5-9752-859edd2ed3a9.png">

## Usage
The package is lazy-loaded, use the `Textual Velocity: Start Session` [command](https://atom.io/docs/v1.4.3/getting-started-atom-basics#command-palette) to get started.

By default notes are saved in `~/.atom/notes`, you can change it through the `textual-velocity:path` [config](https://atom.io/docs/api/v1.5.0/Config) setting.

You may also want to set a global shortcut to toggle the Atom window, see my [init config](docs/init.coffee) for an example of how this can be setup when the package is activated.

The `core.ignoredNames` and `core.excludeVcsIgnoredPaths` are respected, but you need to restart a session for the changes to apply.

See [keymaps](keymaps/textual-velocity.cson) for available shortcuts.

Also, I recommend the following packages, that works great in combination with textual-velocity:
- [quick-file-actions](https://atom.io/packages/quick-file-actions) - Quickly copy, delete, move, and create new files
- [file-icons](https://atom.io/packages/file-icons) - Assign file extension icons and colours for improved visual grepping
- [preview](https://atom.io/packages/preview) - Ultimate previewer of source code in Atom.
- [recent-files-fuzzy-finder](https://atom.io/packages/recent-files-fuzzy-finder) - Find recently opened files easier
- [block-travel](https://atom.io/packages/block-travel) - Quickly travel up/down between blocks of code

## Installation
`apm install textual-velocity`, or search & install it through the settings.
