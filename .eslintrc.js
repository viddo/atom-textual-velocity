module.exports = {
  extends: ["prettier"],
  parser: "babel-eslint",
  plugins: ["prettier", "flowtype"],
  rules: {
    "prettier/prettier": "error",
    "flowtype/define-flow-type": 1,
    "flowtype/use-flow-type": 1
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true
    }
  },
  globals: {
    advanceClock: false,
    afterEach: false,
    atom: false,
    beforeAll: false,
    beforeEach: false,
    describe: false,
    Event: false,
    expect: false,
    HTMLElement: false,
    HTMLInputElement: false,
    it: false,
    jasmine: false,
    spyOn: false,
    runs: false,
    xdescribe: false,
    setupBuses: false,
    waitsFor: false,
    waitsForPromise: false
  }
};
