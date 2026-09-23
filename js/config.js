// URL do backend no Raspberry Pi (Tailscale Funnel). O workflow de deploy substitui __BACKEND_URL__ pela
// variavel BACKEND_URL do repositorio; na tela de login da para apontar para outro Pi (fica no localStorage).
(function () {
  "use strict";
  var built = "__BACKEND_URL__";
  var fallback = "https://SEU-PI.tailXXXX.ts.net:8443";
  var saved = null;
  try { saved = localStorage.getItem("backend_url"); } catch (e) { /* modo privado */ }
  window.SCANNER_CONFIG = {
    BACKEND_URL: (saved || (built.indexOf("__") === 0 ? fallback : built)).replace(/\/+$/, ""),
    DEFAULT_TIMEZONE: "America/Sao_Paulo",
    HEALTH_EVERY_MS: 30000
  };
})();
