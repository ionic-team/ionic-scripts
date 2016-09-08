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
    SCRIPTS_GENERATED_DIR
} from '../constants';

import { cleanWww } from '../building-blocks/clean-www';
import { copyAndBuildTypescript } from '../building-blocks/ngc-build';
import { runRollup } from '../building-blocks/run-rollup';
import { transpileToEs5 } from '../building-blocks/transpile-to-es5';
import { minify } from '../building-blocks/minify-bundle';
import { copyBundles } from '../building-blocks/copy-bundles-to-app';
import { copyFile } from '../building-blocks/copy-file';

export function buildIonicApp() {
    cleanWww();

    // start async flow
    copyAndBuildTypescript({absolutePathSrcDir: PROJECT_SRC_ROOT,
        absolutePathTsConfig: `${PROJECT_ROOT}/tsconfig.json`,
        absolutePathDestDir: INTERNAL_BUILD_DIR,
        includeGlob: ['./app/ng-module.ts', './app/main.ts', './app/polyfills.ts']
    }).then( () => {
        // we have a directory of ngc'd js, time to do something interesting with it
        return runRollup(INTERNAL_BUILD_NGC_ENTRY_POINT, INTERNAL_BUILD_BUNDLES_ES6);
    }).then( () => {
        // we have an es6 bundle created, so now we need to transpile to es5
        // just in case any of the bundled code is es6+
        return transpileToEs5(INTERNAL_BUILD_BUNDLES_ES6, INTERNAL_BUILD_BUNDLES_ES5);
    }).then( () => {
        // we have an es5 bundle, so we'd better minify it now
        return minify(INTERNAL_BUILD_BUNDLES_ES5, INTERNAL_BUILD_BUNDLES_MIN);
    }).then( () => {
        // write the bundles back to the users's app
        return copyBundles(INTERNAL_BUILD_BUNDLES_ES5, INTERNAL_BUILD_BUNDLES_MIN, PROJECT_BUNDLE_OUTPUT, PROJECT_BUNDLE_MIN_OUTPUT);
    }).then( () => {
        // copy the html file over
        copyFile(PROJECT_SRC_INDEX_HTML, PROJECT_WWW_INDEX_HTML);
    });
}