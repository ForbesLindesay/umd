;(function (f) {
  // CommonJS
  if (typeof exports === "object") {
    module.exports = f();

  // RequireJS
  } else if (typeof define === "function" && define.amd) {
    define(f);

  // <script>
  } else {
    if (typeof window !== "undefined") {
      setup(window, {{name}}, f())
    } else if (typeof global !== "undefined") {
      setup(global, {{name}}, f())
    } else if (typeof self !== "undefined") {
      setup(self, {{name}}, f())
    }
  }

  function setup(object, name, value) {
    var key
    var names = name.split('.')
    while (key = names.shift()) {
      object[key] = object[key] || (names.length? {} : value)
      object = object[key]
    }
  }

})(function () {
  source()//trick uglify-js into not minifying
});
