;(function (f) {
  // CommonJS
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();

  // RequireJS
  } else if (typeof define === "function" && define.amd) {
    define([], f);

  // <script>
  } else {
    var g = typeof global == 'undefined' ? this : global;
    defineNamespace()
  }

})(function () {
  source()//trick uglify-js into not minifying
});
