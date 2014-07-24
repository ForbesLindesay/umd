'use strict';

var through = require('through');
var rfile = require('rfile');
var uglify = require('uglify-js');
var templateSTR = rfile('./template.js');

function template(moduleName, cjs, options) {
  options = options || {};
  var wrapper = templateSTR
    .replace(/\{\{defineNamespace\}\}/g, compileNamespace(moduleName))
    .replace(/\{\{amdDependencies\}\}/g, compileAmdDependencies(options.amd));

  var str = uglify.minify(
    wrapper,
    {fromString: true}).code
    .split('source()')
  str[0] = str[0].trim();
  //make sure these are undefined so as to not get confused if modules have inner UMD systems
  str[0] += 'var define,module,exports;';
  if (cjs) str[0] += 'module={exports:(exports={})};';
  str[0] += '\n';
  if (cjs) str[1] = 'return module.exports;' + str[1];
  str[1] = '\n' + str[1];
  return str;
}

exports = module.exports = function (name, cjs, src, options) {
  if (typeof cjs === 'string') {
    var tmp = cjs;
    cjs = src;
    src = tmp;
  }

  if (src) {
    return exports.prelude(name, cjs, options) + src + exports.postlude(name, cjs);
  }
  var strm = through(write, end);
  var first = true;
  function write(chunk) {
    if (first) strm.queue(exports.prelude(name, cjs, options));
    first = false;
    strm.queue(chunk);
  }
  function end() {
    if (first) strm.queue(exports.prelude(name, cjs, options));
    strm.queue(exports.postlude(name, cjs));
    strm.queue(null);
  }
  return strm;
};

exports.prelude = function (moduleName, cjs, options) {
  return template(moduleName, cjs, options)[0];
};
exports.postlude = function (moduleName, cjs) {
  return template(moduleName, cjs)[1];
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

function compileAmdDependencies(amdOptions) {
  amdOptions = amdOptions || {};
  var depArray = amdOptions.deps || [];
  var depString = '';
  if (depArray.length) {
    depString = '"' + depArray.join('","') + '"';
  }
  return depString;
}

