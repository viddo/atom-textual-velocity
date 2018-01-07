// https://flowtype.org/docs/troubleshooting.html#required-module-not-found
// fixes the import of the coffeescript source file which transpiled JS file is not available to flow
declare module './ScandalPathFilter' {
  declare module.exports: any;
}
