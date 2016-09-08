import { basename, dirname, join, sep } from 'path';
import { writeFile } from 'fs';


export function componentSass(moduleIds: string[], opts?: Options) {
  console.log(`[componentSass]`);

  // Ensure file's parent directory in the include path
  opts.includePaths = opts.includePaths || [];
  opts.includePaths.unshift(dirname(opts.outFile));

  opts.excludeModules = (opts.excludeModules || []).map(function(excludeModule) {
    return sep + excludeModule;
  });

  opts.sortComponentPathsFn = (opts.sortComponentPathsFn || defaultSortComponentPathsFn);
  opts.sortComponentFilesFn = (opts.sortComponentFilesFn || defaultSortComponentFilesFn);

  opts.componentSassFiles = (opts.componentSassFiles || ['*.scss']);

  if (!opts.file) {
    generateSassData(moduleIds, opts);
  }

  renderSass(opts);
}


function generateSassData(moduleIds: string[], opts: Options) {
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

  const moduleDirectories: string[] = [];
  moduleIds.forEach(moduleId => {
    const moduleDirectory = dirname(moduleId);
    if (moduleDirectories.indexOf(moduleDirectory) < 0) {
      moduleDirectories.push(moduleDirectory);
    }
  });

  const userSassVariableFiles = getUserSassVariableFiles(opts);
  const componentSassFiles = getComponentSassFiles(moduleDirectories, opts);

  const sassImports = userSassVariableFiles.concat(componentSassFiles).map(sassFile => '"' + sassFile + '"');

  if (sassImports.length) {
    opts.data = `
      @charset "UTF-8";
      @import ${sassImports.join(',')};
    `;
  }
}


function getUserSassVariableFiles(opts: Options) {
  // user variable files should be the very first imports
  if (Array.isArray(opts.variableSassFiles)) {
    return opts.variableSassFiles;
  }
  return [];
}


function getComponentSassFiles(moduleDirectories: string[], opts: Options) {
  const glob = require('glob-all');

  const componentSassFiles: string[] = [];
  const componentDirectories = getComponentDirectories(moduleDirectories, opts);

  // sort all components with the library components being first
  // and user components coming lass, so it's easier for user css
  // to override library css with the same specificity
  const sortedComponentPaths = componentDirectories.sort(opts.sortComponentPathsFn);

  sortedComponentPaths.forEach(componentPath => {
    let componentFiles: string[] = glob.sync(opts.componentSassFiles, {
      cwd: componentPath
    });

    if (!componentFiles.length && componentPath.indexOf(sep + 'node_modules' +  sep) === -1) {
      // if we didn't find anything, see if this module is mapped to another directory
      for (const k in opts.directoryMaps) {
        componentPath = componentPath.replace(sep + k + sep, sep + opts.directoryMaps[k] + sep);
        componentFiles = glob.sync(opts.componentSassFiles, {
          cwd: componentPath
        });
      }
    }

    if (componentFiles.length) {
      componentFiles = componentFiles.sort(opts.sortComponentFilesFn);

      componentFiles.forEach(componentFile => {
        componentSassFiles.push(join(componentPath, componentFile));
      });
    }
  });

  return componentSassFiles;
}


function getComponentDirectories(moduleDirectories: string[], opts: Options) {
  // filter out module directories we know wouldn't have sibling component sass file
  // just a way to reduce the amount of lookups to be done later
  return moduleDirectories.filter(moduleDirectory => {
    for (var i = 0; i < opts.excludeModules.length; i++) {
      if (moduleDirectory.indexOf(opts.excludeModules[i]) > -1) {
        return false;
      }
    }
    return true;
  });
}


function renderSass(opts: Options) {
  const nodeSass = require('node-sass');

  if (opts.sourceMap) {
    opts.sourceMap = basename(opts.outFile);
    opts.omitSourceMapUrl = true;
    opts.sourceMapContents = true;
  }

  nodeSass.render(opts, (renderErr: any, sassResult: SassResult) => {
    if (renderErr) {
      // sass render error!
      console.log('[Sass error] line', renderErr.line, ' column', renderErr.column);
      console.log(renderErr.message);

    } else {
      // sass render success!
      renderSassSuccess(sassResult, opts);
    }
  });
}


function renderSassSuccess(sassResult: SassResult, opts: Options) {
  if (opts.autoprefixer) {
    // with autoprefixer
    const postcss = require('postcss');
    const autoprefixer = require('autoprefixer');

    postcss([autoprefixer(opts.autoprefixer)])
      .process(sassResult.css, {
        to: basename(opts.outFile),
        map: { inline: false }

      }).then((postCssResult: any) => {
        postCssResult.warnings().forEach((warn: any) => {
          console.warn(warn.toString());
        });

        let apMapResult: string = null;
        if (postCssResult.map) {
          apMapResult = JSON.parse(postCssResult.map.toString()).mappings;
        }

        writeOutput(opts, postCssResult.css, apMapResult);
      });

  } else {
    // without autoprefixer
    generateSourceMaps(sassResult, opts);

    let sassMapResult: string = null;
    if (sassResult.map) {
      sassMapResult = JSON.parse(sassResult.map.toString()).mappings;
    }

    writeOutput(opts, sassResult.css, sassMapResult);
  }

}


function generateSourceMaps(sassResult: SassResult, opts: Options) {
    // Build Source Maps!
    if (sassResult.map) {
      // Transform map into JSON
      const sassMap: SassMap = JSON.parse(sassResult.map.toString());

      // Grab the stdout and transform it into stdin
      const sassMapFile = sassMap.file.replace(/^stdout$/, 'stdin');

      // Grab the base file name that's being worked on
      const sassFileSrc = opts.outFile;

      // Grab the path portion of the file that's being worked on
      const sassFileSrcPath = dirname(sassFileSrc);
      if (sassFileSrcPath) {
        //Prepend the path to all files in the sources array except the file that's being worked on
        const sourceFileIndex = sassMap.sources.indexOf(sassMapFile);
        sassMap.sources = sassMap.sources.map((source, index) => {
          return (index === sourceFileIndex) ? source : join(sassFileSrcPath, source);
        });
      }

      // Remove 'stdin' from souces and replace with filenames!
      sassMap.sources = sassMap.sources.filter(src => {
        if (src !== 'stdin') {
          return src;
        }
      });

      // Replace the map file with the original file name (but new extension)
      //sassMap.file = gutil.replaceExtension(sassFileSrc, '.css');
      // Apply the map
      //applySourceMap(file, sassMap);
    }
}


function writeOutput(opts: Options, cssOutput: string, mappingsOutput: string) {

  writeFile(opts.outFile, cssOutput, (fsWriteErr) => {
    if (fsWriteErr) {
      console.log('Error writing css file:', fsWriteErr);

    } else {
      console.log('Saved:', opts.outFile);

      if (mappingsOutput) {
        const sourceMapPath = join(dirname(opts.outFile), basename(opts.outFile) + '.map');

        writeFile(sourceMapPath, mappingsOutput, (fsWriteErr) => {
          if (fsWriteErr) {
            console.log('Error writing css map file:', fsWriteErr);

          } else {
            console.log('Saved:', sourceMapPath);
          }
        });
      }
    }
  });
}


function defaultSortComponentPathsFn(a: any, b: any): number {
  const aIndexOfNodeModules = a.indexOf('node_modules');
  const bIndexOfNodeModules = b.indexOf('node_modules');

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


function defaultSortComponentFilesFn(a: any, b: any): number {
  const aPeriods = a.split('.').length;
  const bPeriods = b.split('.').length;
  const aDashes = a.split('-').length;
  const bDashes = b.split('-').length;

  if (aPeriods > bPeriods) {
    return 1;
  } else if (aPeriods < bPeriods) {
    return -1
  }

  if (aDashes > bDashes) {
    return 1;
  } else if (aDashes < bDashes) {
    return -1
  }

  return (a > b) ? 1 : -1;
}


export interface Options {
  outFile: string;
  file?: string;
  data?: string;
  includePaths?: string[];
  excludeModules?: string[];
  componentSassFiles?: string[];
  directoryMaps?: string[];
  sortComponentPathsFn?: (a: any, b: any) => number;
  sortComponentFilesFn?: (a: any, b: any) => number;
  variableSassFiles?: string[];
  autoprefixer?: any;
  sourceMap?: string;
  omitSourceMapUrl?: boolean;
  sourceMapContents?: boolean;
}


export interface SassResult {
  css: string;
  map: SassMap;
}


export interface SassMap {
  file: string;
  sources: any[];
}
