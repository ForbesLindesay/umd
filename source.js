'use strict';

var fs = require('fs');
var templateSTR = fs.readFileSync(__dirname + '/template.min.js', 'utf8');
var camelize = require('camelize-identifier');

function template(moduleName, options) {
  if (typeof options === 'boolean') {
    options = {commonJS: options};
  } else if (!options) {
    options = {};
  }
  var str = templateSTR.replace(/defineNamespace\(\)/g, compileNamespace(moduleName))
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

exports = module.exports = function (name, src, options) {
  if (typeof options === 'string' && typeof src === 'object') {
    var tmp = options;
    options = src;
    src = tmp;
  }
  return exports.prelude(name, options) + src + exports.postlude(name, options);
};

exports.prelude = function (moduleName, options) {
  return template(moduleName, options)[0];
};
exports.postlude = function (moduleName, options) {
  return template(moduleName, options)[1];
};

function compileNamespace(name) {
  var names = name.split('.')

  // No namespaces, yield the best case 'global.NAME = VALUE'
  if (names.length === 1) {
    return 'g.' + camelize(name) + ' = f()';

  // Acceptable case, with reasonable compilation
  } else if (names.length === 2) {
    names = names.map(camelize);
    return '(g.' + names[0] + ' || (g.' + names[0] + ' = {})).' + names[1] + ' = f()';

  // Worst case, too many namespaces to care about
  } else {
    var valueContainer = names.pop()
    return names.map(compileNamespaceStep)
                .concat(['g.' + camelize(valueContainer) + ' = f()'])
                .join(';');
  }
}

function compileNamespaceStep(name) {
  name = camelize(name);
  return 'g=(g.' + name + '||(g.' + name + ' = {}))';
}
