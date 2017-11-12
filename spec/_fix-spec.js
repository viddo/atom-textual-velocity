/* @flow */

import { defaultConfig } from "../lib/config";

// Remove the custom equalityTest added by atom:
// https://github.com/atom/atom/blob/1500381ac9216bd533199f5b59460b5ac596527c/spec/spec-helper.coffee#L45
// so assertions such as `expect(foo).toEqual(jasmine.any(Object))` works
global.jasmine.getEnv().equalityTesters_ = [];

const TESTING_VARS = "textual-velocity-testing-vars";
global.setProcessInTesting = function setProcessInTesting(
  _process: any,
  options?: ProcessInTesting
) {
  if (!_process || !options) {
    throw new Error(
      "Not able to set/reset testing variables because of misuse of setProcessInTesting -- please fix"
    );
  }

  if (options === TESTING_VARS) {
    delete _process[TESTING_VARS];
  } else if (_process[TESTING_VARS]) {
    _process[TESTING_VARS] = {
      ..._process[TESTING_VARS],
      ...options
    };
  } else {
    _process[TESTING_VARS] = options;
  }
};

global.getProcessInTesting = function getProcessInTesting(
  _process: any
): ProcessInTesting {
  return _process[TESTING_VARS] || {};
};

beforeEach(() => {
  atom.config.setSchema("textual-velocity", {
    type: "object",
    properties: JSON.parse(JSON.stringify(defaultConfig))
  });
});

afterEach(() => {
  global.setProcessInTesting(process, TESTING_VARS);
});
