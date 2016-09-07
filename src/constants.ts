import { join } from 'path';

// various
export const NODE_MODULES = 'node_modules';
export const SRC = 'src';
export const WWW = 'www';
export const INDEX_HTML = 'index.html';


// paths
export const PROJECT_ROOT = process.cwd();
export const SCRIPTS_ROOT = join(PROJECT_ROOT, NODE_MODULES, 'ionic-scripts');

export const NODE_MODULES_DIR = join(PROJECT_ROOT, NODE_MODULES);
export const PROJECT_WWW_DIR = join(PROJECT_ROOT, WWW);
export const PROJECT_SRC_ROOT = join(PROJECT_ROOT, SRC);
export const PROJECT_SRC_INDEX_HTML = join(PROJECT_SRC_ROOT, INDEX_HTML);

export const PROJECT_WWW_INDEX_HTML = join(PROJECT_WWW_DIR, INDEX_HTML);