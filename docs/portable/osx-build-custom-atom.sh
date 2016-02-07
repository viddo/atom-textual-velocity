#!/bin/bash
# This builds a custom version of the Atom, using the PR of https://github.com/atom/atom/issues/10072
# and merging in master to have latest changes
# The output will be Atom.app in this directory
set -x
PWD="$(dirname "$0")"
if [ ! -d "atom" ]; then
  git clone https://github.com/atom/atom.git
fi
pushd atom
git co master
git pull
git co dr-portable-mode-mac
git merge master -m "Merge in master"
script/clean
script/build --install-dir "$PWD"
popd
echo "Done!"
