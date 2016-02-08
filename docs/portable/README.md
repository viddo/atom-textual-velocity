It's not in the official docs but Atom supports to be run as in "portable" mode*. 
The benefit of this is that you can run Atom as a kind of "standalone application", 
and personalize what packages and settings to use for the particular window instace.

The easiest is probably to open a new window with portable mode by set/export the `ATOM_HOME` environment variable before starting atom:
```bash
ATOM_HOME="path/to/custom/.atom" atom path/to/notes
```

If you have a Atom.exe/Atom.app/atom located somewhere custom, you can use also use the [`--portable`](https://github.com/atom/atom/issues/10072#issuecomment-165896830) flag.

```bash
# ~/.atom will be copied to /path/to/custom unless it already exists, from there on all settings are fetched from there
/path/to/custom/atom --portable path/to/notes
```

*Unfortunately it is not completely portalbe on OSX, init/config files are still loaded from default location.
But there is a [pending PR](https://github.com/atom/atom/pull/9443) that solves this, you can build a custom Atom app from that one.
To save you from the trouble of figuring out all the steps yourself, I've provided a bash [`osx-build-custom-atom.sh`](osx-build-custom-atom.sh) that does all the necessary things.
