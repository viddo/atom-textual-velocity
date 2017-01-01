Assuming repo permissions:

- Check that all CIs pass
- Add `[vX.Y.Z] - yyyy-mm-dd` below `[unreleased]` section in [CHANGELOG.md](CHANGELOG.md), commit
- Run `apm publish [<newversion> | major | minor | patch | build]` (see `apm help publish` for details)
- Add the recent changes from [changelog](CHANGELOG.md) to the [new release tag](https://github.com/viddo/atom-textual-velocity/releases)
