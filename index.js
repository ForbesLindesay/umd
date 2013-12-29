'use strict';

var Transform = require('stream').Transform;
var rfile = require('rfile');
var uglify = require('uglify-js');
var templateSTR = rfile('./template.js');

function template(moduleName, cjs) {
  var str = uglify.minify(
    templateSTR.replace(/\{\{defineNamespace\}\}/g, compileNamespace(moduleName)),
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

exports = module.exports = function (name, cjs, src) {
  if (typeof cjs === 'string') {
    var tmp = cjs;
    cjs = src;
    src = tmp;
  }
  if (src) {
    return exports.prelude(name, cjs) + exports.renameRequire(src) + exports.postlude(name, cjs);
  } else {
    var strm = new Transform();
    var buf = '';
    strm._transform = function (chunk, encoding, callback) {
      buf += chunk.toString();
      callback();
    };
    strm._flush = function (callback) {
      strm.push(exports(name, cjs, buf));
      callback();
    };
    return strm;
  }
};

exports.prelude = function (moduleName, cjs) {
  return template(moduleName, cjs)[0];
};
exports.postlude = function (moduleName, cjs) {
  return template(moduleName, cjs)[1];
};
exports.renameRequire = function (src) {
  var ast = uglify.parse(src);
  
  
  var output = uglify.OutputStream({
    indent_level: 2,
    beautify: true,
    comments: true
  });
  ast.print(output);
  return output.toString();
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
