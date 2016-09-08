import { exec } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { src, dest } from 'vinyl-fs';

import { NGC_BIN_PATH } from '../constants';

function runNgc(pathToConfigFile: string, doneCallback: Function) {
    const shellCommand = `${NGC_BIN_PATH} -p ${pathToConfigFile}`;
    exec(shellCommand, function(err: Error, stdout: string, stderr: string) {
        console.log(stdout);
        console.log(stderr);
        doneCallback(err);
    });
}

function openAndParseJsonFile(absolutePath: string) {
    var jsonString = readFileSync(absolutePath).toString();
    return JSON.parse(jsonString);
}

function createTempTsConfig(absolutePathToOriginal: string, includeGlob: string[], absolutePathToWriteFile: string) {
    var originalConfig = openAndParseJsonFile(absolutePathToOriginal);
    if (!originalConfig) {
        throw new Error('Could not find original config file');
    }

    if (!originalConfig.compilerOptions) {
        throw new Error('TSConfig is missing necessary compiler options');
    }

    // delete outDir if it's set since we only want to compile to the same directory we're in
    if (originalConfig.compilerOptions.outDir) {
        delete originalConfig.compilerOptions.outDir;
    }

    // downstream, we have a dependency on es5 code and es2015 modules, so force them
    originalConfig.compilerOptions.module = 'es2015';
    originalConfig.compilerOptions.target = 'es5';

    originalConfig.include = includeGlob;

    var json = JSON.stringify(originalConfig, null, 2);

    writeFileSync(absolutePathToWriteFile, json);
}

function copyTypescriptSourceToDestination(absolutePathSourceDir: string, absolutePathDestDir: string, excludeSpecBool: boolean) {
    var sourceGlob = [absolutePathSourceDir + '/**/*.ts'];
    if (excludeSpecBool) {
        sourceGlob.push('!' + absolutePathSourceDir + '/**/*.spec.ts');
    }
    return src(sourceGlob).pipe(dest(absolutePathDestDir));
}

export function copyAndBuildTypescript(options: NgcBuildOptions): Promise<any> {
    return new Promise((resolve, reject) => {
        console.log("Src Path: ", options.absolutePathSrcDir);
        console.log("Dest Path: ", options.absolutePathDestDir);
        var stream = copyTypescriptSourceToDestination(options.absolutePathSrcDir, options.absolutePathDestDir, true);
        stream.on('end', function() {
            var destTsConfigPath = options.absolutePathDestDir + '/tsconfig.json';
            createTempTsConfig(options.absolutePathTsConfig, options.includeGlob, destTsConfigPath);
            runNgc(destTsConfigPath, function(err) {
                if ( err ){
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}

export interface NgcBuildOptions {
    absolutePathSrcDir: string;
    absolutePathDestDir: string;
    absolutePathTsConfig: string;
    includeGlob: string[];
}