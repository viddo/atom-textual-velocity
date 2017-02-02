## flow-typed

The definitions under the `npm` folder here are pulled down from
[`flow-typed`](https://github.com/flowtype/flow-typed). Please do not change these files directly.

### Updating these definitions

1. Put up a pull request on [`flow-typed`](https://github.com/flowtype/flow-typed) with the proposed changes, -or- here if its for some source that's only local for now.
2. Once it's merged, update the files:
  - `npm install -g flow-typed`
  - `flow-typed install`
3. Some packages might need manual install, e.g. RxJS:
  - `flow-typed install rxjs@5.0.0 -o`
    - `-o` just indicates the the existing defs should be overwritten
