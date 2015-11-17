;(function (g, f) {
  // CommonJS
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();

  // RequireJS
  } else if (typeof define === "function" && define.amd) {
    define([], f);

  // <script>
  } else {
    defineNamespace()
  }

})(this, function () {
  source()//trick uglify-js into not minifying
});
