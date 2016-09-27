#!/bin/bash
set -x
THIS_DIR="$(dirname "$0")"
cd "$THIS_DIR"
# custom ATOM_HOME to run the init script located there
# override user-data-dir due to https://github.com/atom/atom/issues/11806#issuecomment-249862337
ATOM_HOME="$THIS_DIR/.atom" open "/Applications/Atom Beta.app" --args --user-data-dir ~/Library/Application\ Support/AtomBeta
