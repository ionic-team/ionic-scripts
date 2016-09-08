/**
 * Simple way to ensure all scripts are using the same
 * version of dependencies. Ultimately this is to reduce
 * how many dependencies the user has to download from NPM.
 */
var fs = require('fs');
var path = require('path');
var masterPackageJson = JSON.parse(fs.readFileSync('./package.json'));

var projects = [
  './component-sass',
  './ionic-ts-build'
];

projects.forEach(function(projectRoot) {
  var projectPackageJsonFile = path.join(projectRoot, 'package.json');
  var projectPackageJson = JSON.parse(fs.readFileSync(projectPackageJsonFile));

  projectPackageJson.homepage = masterPackageJson.homepage;
  projectPackageJson.author = masterPackageJson.author;
  projectPackageJson.license = masterPackageJson.license;
  projectPackageJson.repository = masterPackageJson.repository;
  projectPackageJson.bugs = masterPackageJson.bugs;

  if (projectPackageJson.dependencies && masterPackageJson.devDependencies) {
    for (var key in projectPackageJson.dependencies) {
      if (masterPackageJson.devDependencies[key]) {
        projectPackageJson.dependencies[key] = masterPackageJson.devDependencies[key];
      }
    }
  }

  if (projectPackageJson.devDependencies && masterPackageJson.devDependencies) {
    for (var key in projectPackageJson.devDependencies) {
      if (masterPackageJson.devDependencies[key]) {
        projectPackageJson.devDependencies[key] = masterPackageJson.devDependencies[key];
      }
    }
  }

  var projectPackageJsonStr = JSON.stringify(orderKeys(projectPackageJson), null, 2);

  fs.writeFile(projectPackageJsonFile, projectPackageJsonStr, function(err){
    if (err) throw err;
    console.log('Updated', projectPackageJsonFile);
  });
});


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
