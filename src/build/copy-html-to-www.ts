
import { readFileSync, writeFileSync } from 'fs';
import { PROJECT_SRC_INDEX_HTML, PROJECT_WWW_INDEX_HTML } from '../constants';

export function copySrcHtmlToWWW() {
    let fileContent = readFileSync(PROJECT_SRC_INDEX_HTML);
    writeFileSync(PROJECT_WWW_INDEX_HTML, fileContent);
}