"use strict";
var path_1 = require('path');
var fs_1 = require('fs');
function componentSass(moduleIds, opts) {
    console.log("[componentSass]");
    // Ensure file's parent directory in the include path
    opts.includePaths = opts.includePaths || [];
    opts.includePaths.unshift(path_1.dirname(opts.outFile));
    opts.excludeModules = (opts.excludeModules || []).map(function (excludeModule) {
        return path_1.sep + excludeModule;
    });
    opts.sortComponentPathsFn = (opts.sortComponentPathsFn || defaultSortComponentPathsFn);
    opts.sortComponentFilesFn = (opts.sortComponentFilesFn || defaultSortComponentFilesFn);
    opts.componentSassFiles = (opts.componentSassFiles || ['*.scss']);
    if (!opts.file) {
        generateSassData(moduleIds, opts);
    }
    renderSass(opts);
}
exports.componentSass = componentSass;
function generateSassData(moduleIds, opts) {
    /**
     * 1) Import user sass variables first since user variables
     *    should have precedence over default library variables.
     * 2) Import all library sass files next since library css should
     *    be before user css, and potentially have library css easily
     *    overridden by user css selectors which come after the
     *    library's in the same file.
     * 3) Import the user's css last since we want the user's css to
     *    potentially easily override library css with the same
     *    css specificity.
     */
    var moduleDirectories = [];
    moduleIds.forEach(function (moduleId) {
        var moduleDirectory = path_1.dirname(moduleId);
        if (moduleDirectories.indexOf(moduleDirectory) < 0) {
            moduleDirectories.push(moduleDirectory);
        }
    });
    var userSassVariableFiles = getUserSassVariableFiles(opts);
    var componentSassFiles = getComponentSassFiles(moduleDirectories, opts);
    var sassImports = userSassVariableFiles.concat(componentSassFiles).map(function (sassFile) { return '"' + sassFile + '"'; });
    if (sassImports.length) {
        opts.data = "\n      @charset \"UTF-8\";\n      @import " + sassImports.join(',') + ";\n    ";
    }
}
function getUserSassVariableFiles(opts) {
    // user variable files should be the very first imports
    if (Array.isArray(opts.variableSassFiles)) {
        return opts.variableSassFiles;
    }
    return [];
}
function getComponentSassFiles(moduleDirectories, opts) {
    var glob = require('glob-all');
    var componentSassFiles = [];
    var componentDirectories = getComponentDirectories(moduleDirectories, opts);
    // sort all components with the library components being first
    // and user components coming lass, so it's easier for user css
    // to override library css with the same specificity
    var sortedComponentPaths = componentDirectories.sort(opts.sortComponentPathsFn);
    sortedComponentPaths.forEach(function (componentPath) {
        var componentFiles = glob.sync(opts.componentSassFiles, {
            cwd: componentPath
        });
        if (!componentFiles.length && componentPath.indexOf(path_1.sep + 'node_modules' + path_1.sep) === -1) {
            // if we didn't find anything, see if this module is mapped to another directory
            for (var k in opts.directoryMaps) {
                componentPath = componentPath.replace(path_1.sep + k + path_1.sep, path_1.sep + opts.directoryMaps[k] + path_1.sep);
                componentFiles = glob.sync(opts.componentSassFiles, {
                    cwd: componentPath
                });
            }
        }
        if (componentFiles.length) {
            componentFiles = componentFiles.sort(opts.sortComponentFilesFn);
            componentFiles.forEach(function (componentFile) {
                componentSassFiles.push(path_1.join(componentPath, componentFile));
            });
        }
    });
    return componentSassFiles;
}
function getComponentDirectories(moduleDirectories, opts) {
    // filter out module directories we know wouldn't have sibling component sass file
    // just a way to reduce the amount of lookups to be done later
    return moduleDirectories.filter(function (moduleDirectory) {
        for (var i = 0; i < opts.excludeModules.length; i++) {
            if (moduleDirectory.indexOf(opts.excludeModules[i]) > -1) {
                return false;
            }
        }
        return true;
    });
}
function renderSass(opts) {
    var nodeSass = require('node-sass');
    nodeSass.render(opts, function (renderErr, sassResult) {
        if (renderErr) {
            // sass render error!
            console.log('[Sass error] line', renderErr.line, ' column', renderErr.column);
            console.log(renderErr.message);
        }
        else {
            // sass render success!
            renderSassSuccess(sassResult, opts);
        }
    });
}
function renderSassSuccess(sassResult, opts) {
    if (opts.autoprefixer) {
        // with autoprefixer
        var postcss = require('postcss');
        var autoprefixer = require('autoprefixer');
        postcss([autoprefixer(opts.autoprefixer)])
            .process(sassResult.css, {
            to: path_1.basename(opts.outFile),
            map: { inline: false }
        }).then(function (postCssResult) {
            postCssResult.warnings().forEach(function (warn) {
                console.warn(warn.toString());
            });
            var apMapResult = null;
            if (postCssResult.map) {
                apMapResult = JSON.parse(postCssResult.map.toString()).mappings;
            }
            writeOutput(opts, postCssResult.css, apMapResult);
        });
    }
    else {
        // without autoprefixer
        var sassMapResult = null;
        if (sassResult.map) {
            sassMapResult = JSON.parse(sassResult.map.toString()).mappings;
        }
        writeOutput(opts, sassResult.css, sassMapResult);
    }
}
function writeOutput(opts, cssOutput, mappingsOutput) {
    fs_1.writeFile(opts.outFile, cssOutput, function (fsWriteErr) {
        if (fsWriteErr) {
            console.log('Error writing css file:', fsWriteErr);
        }
        else {
            console.log('Saved:', opts.outFile);
            if (mappingsOutput) {
                var sourceMapPath_1 = path_1.join(path_1.dirname(opts.outFile), path_1.basename(opts.outFile) + '.map');
                fs_1.writeFile(sourceMapPath_1, mappingsOutput, function (fsWriteErr) {
                    if (fsWriteErr) {
                        console.log('Error writing css map file:', fsWriteErr);
                    }
                    else {
                        console.log('Saved:', sourceMapPath_1);
                    }
                });
            }
        }
    });
}
function defaultSortComponentPathsFn(a, b) {
    var aIndexOfNodeModules = a.indexOf('node_modules');
    var bIndexOfNodeModules = b.indexOf('node_modules');
    if (aIndexOfNodeModules > -1 && bIndexOfNodeModules > -1) {
        return (a > b) ? 1 : -1;
    }
    if (aIndexOfNodeModules > -1 && bIndexOfNodeModules === -1) {
        return -1;
    }
    if (aIndexOfNodeModules === -1 && bIndexOfNodeModules > -1) {
        return 1;
    }
    return (a > b) ? 1 : -1;
}
function defaultSortComponentFilesFn(a, b) {
    var aPeriods = a.split('.').length;
    var bPeriods = b.split('.').length;
    var aDashes = a.split('-').length;
    var bDashes = b.split('-').length;
    if (aPeriods > bPeriods) {
        return 1;
    }
    else if (aPeriods < bPeriods) {
        return -1;
    }
    if (aDashes > bDashes) {
        return 1;
    }
    else if (aDashes < bDashes) {
        return -1;
    }
    return (a > b) ? 1 : -1;
}
