;(function (f) {
  // Montage Require
  if (typeof bootstrap === "function") {
    bootstrap("{{name}}", f);

  // CommonJS
  } else if (typeof exports === "object") {
    module.exports = f();

  // RequireJS
  } else if (typeof define === "function" && define.amd) {
    define(f);

  // SES (Secure EcmaScript)
  } else if (typeof ses !== "undefined") {
    if (!ses.ok()) {
      return;
    } else {
      ses.make{{pascalcase}} = f;
    }

  // <script>
  } else {
    if (typeof window !== "undefined") {
      window.{{camelcase}} = f();
    } else if (typeof global !== "undefined") {
      global.{{camelcase}} = f();
    } else if (typeof self !== "undefined") {
      self.{{camelcase}} = f();
    }
  }

})(function () {
  source()//trick uglify-js into not minifying
});