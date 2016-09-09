/**
 * Simple way to ensure all scripts are using the same
 * version of dependencies. Ultimately this is to reduce
 * how many dependencies the user has to download from NPM.
 */
var fs = require('fs');
var path = require('path');
var masterPackageJson = JSON.parse(fs.readFileSync('./package.json'));
var masterLicense = fs.readFileSync('./LICENSE');

var projects = [
  './ionic-component-sass',
  './ionic-ts-build'
];

projects.forEach(function(projectRoot) {
  var projectPackageJsonFile = path.join(projectRoot, 'package.json');
  var projectPackageJson = JSON.parse(fs.readFileSync(projectPackageJsonFile));

  // copy over package.json values that should all be the same for each package
  projectPackageJson.homepage = masterPackageJson.homepage;
  projectPackageJson.author = masterPackageJson.author;
  projectPackageJson.license = masterPackageJson.license;
  projectPackageJson.repository = masterPackageJson.repository;
  projectPackageJson.bugs = masterPackageJson.bugs;

  // make sure each project's dependencies/devDependencies are using
  // the same version as the root project so we're all *nsync
  copyVersion(projectPackageJson.dependencies, masterPackageJson.dependencies);
  copyVersion(projectPackageJson.dependencies, masterPackageJson.devDependencies);
  copyVersion(projectPackageJson.devDependencies, masterPackageJson.dependencies);
  copyVersion(projectPackageJson.devDependencies, masterPackageJson.devDependencies);

  // put all the package.json property keys in the same order
  var projectPackageJsonStr = JSON.stringify(orderKeys(projectPackageJson), null, 2);

  // standardize each package.json file
  fs.writeFile(projectPackageJsonFile, projectPackageJsonStr, function(err){
    if (err) throw err;
    console.log('Updated', projectPackageJsonFile);
  });

  // ensure all licenses are the same
  var projectLicenseFile = path.join(projectRoot, 'LICENSE');
  fs.writeFile(projectLicenseFile, masterLicense, function(err){
    if (err) throw err;
    console.log('Updated', projectLicenseFile);
  });

});


function copyVersion(dest, src) {
  if (dest && src) {
    for (var key in dest) {
      if (src[key]) {
        dest[key] = src[key];
      }
    }
  }
}


function orderKeys(oldObj) {
  function copyOver(key) {
    if (oldObj[key] !== undefined) {
      newObj[key] = oldObj[key];
      delete oldObj[key];
    }
  }

  var newObj = {};

  copyOver('name');
  copyOver('version');
  copyOver('description');
  copyOver('homepage');
  copyOver('author');
  copyOver('license');
  copyOver('files');
  copyOver('bin');
  copyOver('main');
  copyOver('jsnext:main');
  copyOver('module');
  copyOver('scripts');
  copyOver('dependencies');
  copyOver('devDependencies');
  copyOver('repository');
  copyOver('bugs');
  copyOver('keywords');

  for (var remainingKey in oldObj) {
    newObj[remainingKey] = oldObj[remainingKey];
  }

  return newObj;
}
