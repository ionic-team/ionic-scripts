import { readFileSync, writeFileSync } from 'fs';

export function copyFile(srcPath: string, destPath: string) {
    let fileContent = readFileSync(srcPath);
    writeFileSync(destPath, fileContent);
}