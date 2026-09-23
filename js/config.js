// Endereco da API. O workflow de deploy substitui __BACKEND_URL__ pela variavel BACKEND_URL do repositorio.
(function () {
  "use strict";
  var built = "__BACKEND_URL__";
  window.SCANNER_CONFIG = {
    BACKEND_URL: (built.indexOf("__") === 0 ? "http://127.0.0.1:8000" : built).replace(/\/+$/, ""),
    DEFAULT_TIMEZONE: "America/Sao_Paulo",
    HEALTH_EVERY_MS: 30000
  };
})();
