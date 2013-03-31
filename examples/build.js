var umd = require('../');
var fs = require('fs');
var join = require('path').join;

fs.createReadStream(join(__dirname, 'cjs', 'index.js'))
  .pipe(umd('common-js-module', true))
  .pipe(fs.createWriteStream(join(__dirname, 'cjs', 'bundle.js')))
  .on('close', end);

fs.createReadStream(join(__dirname, 'raw', 'index.js'))
  .pipe(umd('common-js-module', false))
  .pipe(fs.createWriteStream(join(__dirname, 'raw', 'bundle.js')))
  .on('close', end);
fs.createReadStream(join(__dirname, 'constructor', 'index.js'))
  .pipe(umd('Common-Js-Module', false))
  .pipe(fs.createWriteStream(join(__dirname, 'constructor', 'bundle.js')))
  .on('close', end);

var remaining = 2;
function end() {
  if (0 !== --remaining) return;
  console.log(require('./cjs/bundle'));
  console.log(require('./raw/bundle'));
  console.log(require('./constructor/bundle'));
}