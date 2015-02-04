'use strict';

var through = require('through');
var rfile = require('rfile');
var uglify = require('uglify-js');
var templateSTR = rfile('./template.js');

function template(moduleName, options) {
  if (typeof options === 'boolean') {
    options = {commonJS: options};
  } else if (!options) {
    options = {};
  }
  var str = uglify.minify(
    templateSTR.replace(/\{\{defineNamespace\}\}/g, compileNamespace(moduleName)),
    {fromString: true}).code
    .split('source()')
  str[0] = str[0].trim();
  //make sure these are undefined so as to not get confused if modules have inner UMD systems
  str[0] += 'var define,module,exports;';
  if (options.commonJS) str[0] += 'module={exports:(exports={})};';
  str[0] += '\n';
  if (options.commonJS) str[1] = 'return module.exports;' + str[1];
  str[1] = '\n' + str[1];
  return str;
}

exports = module.exports = function (name, options, src) {
  if (typeof options === 'string') {
    var tmp = options;
    options = src;
    src = tmp;
  }
  if (src) {
    return exports.prelude(name, options) + src + exports.postlude(name, options);
  }
  var strm = through(write, end);
  var first = true;
  function write(chunk) {
    if (first) strm.queue(exports.prelude(name, options));
    first = false;
    strm.queue(chunk);
  }
  function end() {
    if (first) strm.queue(exports.prelude(name, options));
    strm.queue(exports.postlude(name, options));
    strm.queue(null);
  }
  return strm;
};

exports.prelude = function (moduleName, options) {
  return template(moduleName, options)[0];
};
exports.postlude = function (moduleName, options) {
  return template(moduleName, options)[1];
};


function camelCase(name) {
  name = name.replace(/\-([a-z])/g, function (_, char) { return char.toUpperCase(); });
  return name.replace(/[^a-zA-Z0-9]+/g, '')
}


function compileNamespace(name) {
  var names = name.split('.')

  // No namespaces, yield the best case 'global.NAME = VALUE'
  if (names.length === 1) {
    return 'g.' + camelCase(name) + ' = f()';

  // Acceptable case, with reasonable compilation
  } else if (names.length === 2) {
    names = names.map(camelCase);
    return '(g.' + names[0] + ' || (g.' + names[0] + ' = {})).' + names[1] + ' = f()';

  // Worst case, too many namespaces to care about
  } else {
    var valueContainer = names.pop()
    return names.reduce(compileNamespaceStep, ['var ref$ = g'])
                .concat(['ref$.' + camelCase(valueContainer) + ' = f()'])
                .join(';\n    ');
  }
}

function compileNamespaceStep(code, name, i, names) {
  name = camelCase(name);
  code.push('ref$ = (ref$.' + name + ' || (ref$.' + name + ' = {}))')
  return code
}
