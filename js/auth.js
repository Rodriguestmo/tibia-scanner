// Sessao JWT no localStorage. O backend valida a cada requisicao; aqui so guardamos e checamos a validade.
(function () {
  "use strict";
  var KEY = "scanner_token";
  var EXP = "scanner_token_exp";

  function get() {
    try {
      var token = localStorage.getItem(KEY);
      var exp = +localStorage.getItem(EXP);
      if (token && exp && exp * 1000 > Date.now()) return token;
    } catch (e) { /* ignore */ }
    return null;
  }

  function save(token, expiresIn) {
    localStorage.setItem(KEY, token);
    localStorage.setItem(EXP, String(Math.floor(Date.now() / 1000) + (expiresIn || 7200)));
  }

  function clear() {
    try { localStorage.removeItem(KEY); localStorage.removeItem(EXP); } catch (e) { /* ignore */ }
  }

  function logout() {
    clear();
    location.href = "login.html";
  }

  function require() {
    if (!get()) location.replace("login.html");
  }

  window.AUTH = { get: get, save: save, clear: clear, logout: logout, require: require };
})();
