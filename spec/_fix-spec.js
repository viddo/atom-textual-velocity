/* @flow */

import { defaultConfig } from "../lib/config";

// Remove the custom equalityTest added by atom:
// https://github.com/atom/atom/blob/1500381ac9216bd533199f5b59460b5ac596527c/spec/spec-helper.coffee#L45
// so assertions such as `expect(foo).toEqual(jasmine.any(Object))` works
global.jasmine.getEnv().equalityTesters_ = [];

beforeEach(() => {
  atom.config.setSchema("textual-velocity", {
    type: "object",
    properties: JSON.parse(JSON.stringify(defaultConfig))
  });
});
