'use babel'

/**
 * Modify jasmine to work with jasmine.any assertions
* @param {Object} jasmine
 */
export default function (jasmine = global.jasmine) {
  if (jasmine.__onlyDoThisOnce) return
  jasmine.__onlyDoThisOnce = true

  // Remove the custom equalityTest added by atom:
  //
  // https://github.com/atom/atom/blob/1500381ac9216bd533199f5b59460b5ac596527c/spec/spec-helper.coffee#L45
  // , so assertions such as `expect(foo).toEqual(jasmine.any(Object))` works
  jasmine.getEnv().equalityTesters_ = []
}
