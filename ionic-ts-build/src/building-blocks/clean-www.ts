import { PROJECT_WWW_DIR } from '../constants';
import { sync } from 'del';

export function cleanWww() {
    sync(`${PROJECT_WWW_DIR}/*`);
}