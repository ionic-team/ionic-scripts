import * as uglify from 'uglify-js';
import { writeFileSync } from 'fs';

export function minify(sourceFilePath: string, destFilePath: string) {
    const result = uglify.minify(sourceFilePath, {
        mangle: true,
        compress: true
    });
    writeFileSync(destFilePath, result.code);
}