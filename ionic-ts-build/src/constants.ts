import { join } from 'path';

// various
export const NODE_MODULES = 'node_modules';
export const BIN = '.bin';
export const SRC = 'src';
export const WWW = 'www';
export const BUILD = 'build';
export const INDEX_HTML = 'index.html';
export const SCRIPTS_GENERATED_DIR_NAME = 'generated';
export const BUNDLE_NAME = 'bundle.js';
export const BUNDLE_MIN_NAME = 'bundle.min.js';

// user project paths
export const PROJECT_ROOT = process.cwd();
export const PROJECT_GENERATED_DIR = join(PROJECT_ROOT, 'generated');
export const NODE_MODULES_DIR = join(PROJECT_ROOT, NODE_MODULES);
export const PROJECT_WWW_DIR = join(PROJECT_ROOT, WWW);
export const PROJECT_SRC_ROOT = join(PROJECT_ROOT, SRC);
export const PROJECT_SRC_INDEX_HTML = join(PROJECT_SRC_ROOT, INDEX_HTML);
export const PROJECT_WWW_INDEX_HTML = join(PROJECT_WWW_DIR, INDEX_HTML);
export const PROJECT_WWW_BUILD_DIR = join(WWW, BUILD);
export const PROJECT_BUNDLE_OUTPUT = join(PROJECT_WWW_BUILD_DIR, BUNDLE_NAME);
export const PROJECT_BUNDLE_MIN_OUTPUT = join(PROJECT_WWW_BUILD_DIR, BUNDLE_MIN_NAME);


// bin paths (node_modules)
export const NGC_BIN_PATH = join(NODE_MODULES_DIR, BIN, 'ngc');
export const TSC_BIN_PATH = join(NODE_MODULES_DIR, BIN, 'tsc');

// scripts project paths
export const SCRIPTS_ROOT = join(PROJECT_ROOT, NODE_MODULES, '@ionic', 'scripts');
//export const SCRIPTS_GENERATED_DIR = join(SCRIPTS_ROOT, SCRIPTS_GENERATED_DIR_NAME);
export const INTERNAL_BUILD_DIR = join(PROJECT_GENERATED_DIR, BUILD);

// js bundle stuff
export const INTERNAL_BUILD_BUNDLES_DIR = join(PROJECT_GENERATED_DIR, 'bundles');
export const INTERNAL_BUILD_BUNDLES_ES6 = join(INTERNAL_BUILD_BUNDLES_DIR, 'bundle.es6.js');
export const INTERNAL_BUILD_BUNDLES_ES5 = join(INTERNAL_BUILD_BUNDLES_DIR, BUNDLE_NAME);
export const INTERNAL_BUILD_BUNDLES_MIN = join(INTERNAL_BUILD_BUNDLES_DIR, BUNDLE_MIN_NAME);
export const INTERNAL_BUILD_NGC_ENTRY_POINT = join(INTERNAL_BUILD_DIR, 'app', 'main.js');