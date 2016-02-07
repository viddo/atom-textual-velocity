It's not in the official docs but Atom supports to be run as in "portable" mode*. The benefit of this is that you can run Atom as a kind of "standalone application", and personalize what packages and settings to use for the particular window instace.

You can use either the [`--portable`](https://github.com/atom/atom/issues/10072#issuecomment-165896830) flag:

```bash
atom --portable path/to/notes
```

Or set/export the `ATOM_HOME` environment variable before starting atom:
```bash
ATOM_HOME="path/to/custom/.atom" atom path/to/notes
```

*Unfortunately does not work exactly as expected on OSX, but there is a [pending PR](https://github.com/atom/atom/pull/9443) that solves this, you can build a custom Atom app from that one.
To save you from the trouble of figuring out all the steps yourself, I've provided a bash [`osx-build-custom-atom.sh`](osx-build-custom-atom.sh) that does all the necessary things.
