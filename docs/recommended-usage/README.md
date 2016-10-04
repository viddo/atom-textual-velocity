# Recommended usage

While the plugin can be run in any Atom window it's recommended to run it in a separate instance for easier usage and access to your notes.

The custom init script [.atom/init.coffee](.atom/init.coffee#L10) contains some code to activate this package on startup, and to register a global keyboard shortcut to easily toggle/access the Atom window and this package's search field.

You may of course copy-paste this to your global Atom init config (typically located at `~/.atom/init.coffee`), but otherwise you can check the the shell script [mac-atom-beta.sh](mac-atom-beta.sh) for an example how to run a separate [Atom beta](https://atom.io/beta) instance (assumed to be installed in the default location), which use a custom atom-home dir to run the custom init script only for this instance.
