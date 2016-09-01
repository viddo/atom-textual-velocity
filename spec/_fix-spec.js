'use babel'

// Remove the custom equalityTest added by atom:
// https://github.com/atom/atom/blob/1500381ac9216bd533199f5b59460b5ac596527c/spec/spec-helper.coffee#L45
// so assertions such as `expect(foo).toEqual(jasmine.any(Object))` works
global.jasmine.getEnv().equalityTesters_ = []
