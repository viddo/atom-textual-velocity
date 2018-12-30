module.exports = {
  env: {
    atomtest: true,
    browser: true,
    es6: true,
    jasmine: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:react/recommended",
    "plugin:flowtype/recommended"
  ],
  parser: "babel-eslint",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["prettier", "flowtype", "react"],
  rules: {
    "no-console": "off",
    "prettier/prettier": "error",
    "react/prop-types": "off", // using flowtype instead
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
