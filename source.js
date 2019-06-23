'use strict';

var fs = require('fs');
var templateSTR = fs.readFileSync(__dirname + '/template.min.js', 'utf8');

function template(moduleNames, options) {
  if (typeof moduleNames === 'string') moduleNames = [moduleNames];
  if (typeof options === 'boolean') {
    options = {commonJS: options};
  } else if (!options) {
    options = {};
  }
  var str = templateSTR.replace(/defineNamespace\(\)/g, compileModuleNames(moduleNames))
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

exports.prelude = function (moduleNames, options) {
  return template(moduleNames, options)[0];
};
exports.postlude = function (moduleNames, options) {
  return template(moduleNames, options)[1];
};


function camelCase(name) {
  name = name.replace(/\-([a-z])/g, function (_, char) { return char.toUpperCase(); });
  if (!/^[a-zA-Z_$]$/.test(name[0])) {
    name = name.substr(1);
  }
  var result = name.replace(/[^\w$]+/g, '')
  if (!result) {
    throw new Error('Invalid JavaScript identifier resulted from camel-casing');
  }
  return result
}


function compileModuleNames(moduleNames) {
  return moduleNames.map(compileNamespace)
                    .concat(['f()'])
                    .join(' = ');
}

function compileNamespace(name) {
  var names = name.split('.')

  // No namespaces, yield the best case 'global.NAME = VALUE'
  if (names.length === 1) {
    return 'g.' + camelCase(name);

  // Acceptable case, with reasonable compilation
  } else if (names.length === 2) {
    names = names.map(camelCase);
    return '(g.' + names[0] + ' || (g.' + names[0] + ' = {})).' + names[1];

  // Worst case, too many namespaces to care about
  } else {
    names[0] = 'g.' + camelCase(names[0]);
    return names.reduce(function (prev, current, index, array) {
             array[index] = current = camelCase(current);
             return '(' + prev + ' || (' + array.slice(0, index).join('.') + ' = {})).' + current;
           });
  }
}
