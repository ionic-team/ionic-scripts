import { INTERNAL_BUILD_DIR,
    INTERNAL_BUILD_NGC_ENTRY_POINT,
    INTERNAL_BUILD_BUNDLES_ES6,
    INTERNAL_BUILD_BUNDLES_ES5,
    INTERNAL_BUILD_BUNDLES_MIN,
    PROJECT_BUNDLE_OUTPUT,
    PROJECT_BUNDLE_MIN_OUTPUT,
    PROJECT_SRC_INDEX_HTML,
    PROJECT_SRC_ROOT,
    PROJECT_ROOT,
    PROJECT_WWW_INDEX_HTML,
    PROJECT_GENERATED_DIR
} from '../constants';

import { cleanWww } from '../building-blocks/clean-www';
import { copyAndBuildTypescript } from '../building-blocks/ngc-build';
import { bundleJs } from '../building-blocks/bundle-js';
import { transpileToEs5 } from '../building-blocks/transpile-to-es5';
import { minify } from '../building-blocks/minify-bundle';
import { copyBundles } from '../building-blocks/copy-bundles-to-app';
import { copyFile } from '../building-blocks/copy-file';

export function buildIonicApp() {
    console.log("Cleaning existing build...");
    cleanWww();
    console.log("Cleaning existing build... DONE");

    // start async flow
    console.log("Copying and building Typescript...");
    copyAndBuildTypescript({absolutePathSrcDir: PROJECT_SRC_ROOT,
      absolutePathTsConfig: `${PROJECT_ROOT}/tsconfig.json`,
        absolutePathDestDir: INTERNAL_BUILD_DIR,
        includeGlob: ['./app/ng-module.ts', './app/main.ts', './app/polyfills.ts']
    }).then( () => {
        console.log("Copying and building Typescript... DONE");
        console.log("Bundling JS files ...");
        // we have a directory of ngc'd js, time to do something interesting with it
        return bundleJs(INTERNAL_BUILD_NGC_ENTRY_POINT, INTERNAL_BUILD_BUNDLES_ES6);
    }).then( () => {
        console.log("Bundling JS files ... DONE");
        console.log("Transpiling to ES5 ...");
        // we have an es6 bundle created, so now we need to transpile to es5
        // just in case any of the bundled code is es6+
        return transpileToEs5(INTERNAL_BUILD_BUNDLES_ES6, INTERNAL_BUILD_BUNDLES_ES5);
    }).then( () => {
        console.log("Transpiling to ES5 ... DONE");
        console.log("Minifying ...");
        // we have an es5 bundle, so we'd better minify it now
        return minify(INTERNAL_BUILD_BUNDLES_ES5, INTERNAL_BUILD_BUNDLES_MIN);
    }).then( () => {
        console.log("Minifying ... DONE");
        console.log("Writing to app www directory ...");
        // write the bundles back to the users's app
        return copyBundles(INTERNAL_BUILD_BUNDLES_ES5, INTERNAL_BUILD_BUNDLES_MIN, PROJECT_BUNDLE_OUTPUT, PROJECT_BUNDLE_MIN_OUTPUT);
    }).then( () => {
        console.log("Writing to app www directory ... DONE");
        console.log("Copying index.html ...");
        // copy the html file over
        copyFile(PROJECT_SRC_INDEX_HTML, PROJECT_WWW_INDEX_HTML);
        console.log("Copying index.html ... DONE");
    }).catch(function(err) {
        console.log("ERROR: ", err.message);
        process.exit(1);
    })
}