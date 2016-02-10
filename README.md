# Textual Velocity for Atom [![Build Status](http://travis-ci.org/viddo/atom-textual-velocity.png)](http://travis-ci.org/viddo/atom-textual-velocity)

TEXTUAL VELOCITY is a package to find your files easier. Ideal for your personal notes, but works just as well for any project with a lot of files (e.g. code projects).

For those of you who used [Notational Velocity](http://notational.net/) or [nvalt](http://brettterpstra.com/projects/nvAlt/) before should feel right at home!

_Note that this package is still WIP, see [v1 roadmap milestone](https://github.com/viddo/atom-textual-velocity/milestones) for details._

<img width="748" alt="screen shot 2016-02-04 at 20 05 58" src="https://cloud.githubusercontent.com/assets/978461/12831123/f48a5964-cb92-11e5-9752-859edd2ed3a9.png">

## Usage
The primary use-case is to use this for notes taking, for this purpose it's recommended to use this [init file](docs/init.coffee).

Start by running `Textual Velocity: Start Session` [command](https://atom.io/docs/v1.4.3/getting-started-atom-basics#command-palette)

The core settings of ""ignored files" and "exclude VCS dirs" are respected.
If you want non-standard settings I'd recommend to run an Atom instance in [portable](docs/portable/README.md) mode.

See [keymaps](keymaps/textual-velocity.cson) for available shortcuts.

## Installation
`apm install textual-velocity`, or search & install it through the settings.
