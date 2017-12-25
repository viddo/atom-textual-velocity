module.exports = {
  env: {
    atomtest: true,
    browser: true,
    es6: true,
    jasmine: true,
    node: true
  },
  extends: ["eslint:recommended", "prettier", "plugin:react/recommended"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["prettier", "flowtype", "react"],
  rules: {
    "no-console": "off",
    "react/no-find-dom-node": "off",
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
    atom: false,
    Event: false,
    HTMLElement: false,
    HTMLInputElement: false,
    setupBuses: false,
    waitsFor: false,
    waitsForPromise: false
  }
};
