;(function (f) {
  // CommonJS
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();

  // RequireJS
  } else if (typeof define === "function" && define.amd) {
    define([], f);

  // <script>
  } else {
    var g = window || global || self;
    
    {{defineNamespace}};
  }

})(function () {
  source()//trick uglify-js into not minifying
});
