
function runTsc() {
    return new Promise(function(resolve, reject){
        var tscCommand = './node_modules/.bin/tsc -p .';
        var exec = require('child_process').exec;
        exec(tscCommand, function(err, stdout, stderr) {
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

function runRollup(entryPointFilePath, outputBundlePath, bundleName) {
    /*var rollup = require('rollup');
    var nodeResolve = require('rollup-plugin-node-resolve');
    var commonjs = require('rollup-plugin-commonjs');
    return rollup.rollup({
        entry: entryPointFilePath,
        plugins: [
            commonjs({}),
            nodeResolve()
        ]
    }).then(function(bundle){
        return bundle.write({
            format: 'cjs',
            dest: outputBundlePath,
        });
    });
    */
    return new Promise(function(resolve, reject) {
        var webpack = require('webpack');
        var config = require('./webpack.config');
        var compiler = webpack(config);
        compiler.run(function(err, stats) {
            if (err) {
                reject(err);
                return;
            }
            resolve(outputBundlePath);
        });
    });
}

function addShebang(pathToFile) {
    var fs = require('fs');
    var fileString = fs.readFileSync(pathToFile).toString();
    var newFileContent = '#!/usr/bin/env node\n' + fileString;
    fs.writeFileSync(pathToFile, newFileContent);
}

function copyNpmPackageJson() {
    var fs = require('fs');
    var fileContent = fs.readFileSync('./build/npm-package.json');
    fs.writeFileSync('./dist/ionic-scripts/package.json', fileContent);
}

function doBuild() {
    if (process.argv.length < 3) {
        throw new Error("An argument for the entry point path is required");
    }

    var entryPoint = process.argv[2];
    entryPoint = entryPoint.replace('src/scripts', 'dist/compiled/scripts').replace('.ts', '.js');

    runTsc()
    .then(function() {
        var path = require('path');
        var distFileName = path.basename(entryPoint);
        var bundleName = distFileName.replace('.js', '').replace('-', '');
        return runRollup(entryPoint, './dist/ionic-scripts/' + distFileName, bundleName);
    }).then(function(bundlePath) {
        return addShebang(bundlePath);
    }).then(function() {
        copyNpmPackageJson();
    }).catch(function(err){
        console.log("ERROR: ", err.message);
        process.exit(1);
    });
}

doBuild();