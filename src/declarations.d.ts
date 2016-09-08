// these packages don't have types definitions in the @types namespace
// so just allow them to be imported as implicit anys

declare module "rollup";
declare module "rollup-plugin-node-resolve";
declare module "rollup-plugin-commonjs";