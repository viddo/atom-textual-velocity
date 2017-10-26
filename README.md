# Textual Velocity [![Travis Build Status](http://travis-ci.org/viddo/atom-textual-velocity.png?branch=master)](http://travis-ci.org/viddo/atom-textual-velocity) [![CircleCI Build status](https://circleci.com/gh/viddo/atom-textual-velocity/tree/master.png?style=shield&circle-token=:circle-token)](https://circleci.com/gh/viddo/atom-textual-velocity) [![David dependency management](https://david-dm.org/viddo/atom-textual-velocity.svg)](https://david-dm.org/viddo/atom-textual-velocity) [![Code Climate](https://codeclimate.com/github/viddo/atom-textual-velocity/badges/gpa.svg)](https://codeclimate.com/github/viddo/atom-textual-velocity)

[![Greenkeeper badge](https://badges.greenkeeper.io/viddo/atom-textual-velocity.svg)](https://greenkeeper.io/)

Your mental notes at your fingertips!

For those of you who used [Notational Velocity](http://notational.net/) or [nvAlt](http://brettterpstra.com/projects/nvAlt/) should feel right at home: it's intended to be an alternative to those applications but with the benefits of the [Atom](https://atom.io/) ecosystem.

<img width="748" alt="screen shot 2016-02-04 at 20 05 58" src="https://cloud.githubusercontent.com/assets/978461/12831123/f48a5964-cb92-11e5-9752-859edd2ed3a9.png">

Caveats:
 - Still WIP, see the [change log](CHANGELOG.md) for what's been done so far, and [v1 roadmap milestone](https://github.com/viddo/atom-textual-velocity/milestones) for planned/upcoming features.
 - Developed and tested on MacOSX, it _should_ work fine on Linux and Windows too but there's no guarantees right now. Help is appreciated!
 - Due to Atom's purpose of being a _text_-editor only text files are intended to be supported, compared to the single-database option NV offers.

## Usage
Use the `Textual Velocity: Start Session` [command](https://atom.io/docs/v1.4.3/getting-started-atom-basics#command-palette) to get started, the package is lazy loaded.

By default notes are saved in `~/.atom/notes`, you can change it in the package settings.

While the plugin can be run in any Atom window it's recommended to run it in a [separate instance for easier usage and access to your notes](docs/recommended-usage/README.md)

Also, I recommend the following packages, that works great in combination with textual-velocity:
- [quick-file-actions](https://atom.io/packages/quick-file-actions) - Quickly copy, delete, move, and create new files
- [file-icons](https://atom.io/packages/file-icons) - Assign file extension icons and colours for improved visual grepping
- [preview](https://atom.io/packages/preview) - Ultimate previewer of source code in Atom.
- [recent-files-fuzzy-finder](https://atom.io/packages/recent-files-fuzzy-finder) - Find recently opened files easier
- [block-travel](https://atom.io/packages/block-travel) - Quickly travel up/down between blocks of code
