import { exec } from 'child_process';
import { TSC_BIN_PATH } from '../constants';

export function transpileToEs5(sourceFile: string, destinationFile: string) {
    return new Promise( (resolve, reject) => {
        const shellCommand = `${TSC_BIN_PATH} --out ${destinationFile} --target es5 --allowJs ${sourceFile}`;
        exec(shellCommand, function(err: Error, stdout: string, stderr: string) {
            console.log(stdout);
            console.log(stderr);
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}