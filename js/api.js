// Cliente HTTP + WebSocket para a API. Erros chegam como chave de traducao ({"error": "auth.x"}).
(function () {
  "use strict";
  var base = function () { return window.SCANNER_CONFIG.BACKEND_URL; };

  function ApiError(key, status) {
    this.key = key;
    this.status = status;
    this.message = t(key);
  }

  function request(method, path, params, body) {
    var url = new URL(base() + path);
    Object.keys(params || {}).forEach(function (k) {
      if (params[k] !== undefined && params[k] !== null && params[k] !== "") url.searchParams.set(k, params[k]);
    });
    var headers = { "Accept": "application/json" };
    var token = window.AUTH.get();
    if (token) headers.Authorization = "Bearer " + token;
    if (body) headers["Content-Type"] = "application/json";
    return fetch(url.toString(), { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined })
      .catch(function () { throw new ApiError("auth.unreachable", 0); })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok) {
            var key = data.error || ("http." + res.status);
            if (res.status === 401 && key === "auth.invalid_token" && !/login\.html$/.test(location.pathname)) {
              window.AUTH.logout();
            }
            throw new ApiError(key, res.status);
          }
          return data;
        });
      });
  }

  var get = function (path, params) { return request("GET", path, params); };
  var lang = function () { return window.I18N.locale(); };
  var enc = encodeURIComponent;

  var api = {
    login: function (password) { return request("POST", "/auth/login", null, { password: password }); },
    verify: function () { return get("/auth/verify"); },
    health: function () { return get("/health"); },
    characters: function (p) { return get("/characters", p); },
    character: function (name) { return get("/characters/" + enc(name)); },
    setTarget: function (name, on) { return request("POST", "/characters/" + enc(name) + "/target", null, { target: on }); },
    correlations: function (p) { return get("/correlations", p); },
    pair: function (a, b) { return get("/correlations/" + enc(a) + "/" + enc(b), { lang: lang() }); },
    clusters: function () { return get("/clusters"); },
    graph: function (p) { return get("/graph", p); },
    heatmap: function (name) { return get("/heatmap/" + enc(name)); },
    timeline: function (name, days) { return get("/timeline/" + enc(name), { days: days || 30 }); },
    investigation: function (name) { return get("/investigation/" + enc(name), { lang: lang() }); },
    compare: function (a, b) { return get("/compare", { char_a: a, char_b: b, lang: lang() }); },
    report: function (name) { return get("/report/" + enc(name), { lang: lang() }); },
    changes: function (hours) { return get("/changes", { hours: hours || 24 }); },
    notifications: function (limit) { return get("/notifications", { limit: limit || 100 }); },

    // WebSocket com reconexao exponencial; handler recebe {type, data}.
    live: function (handler) {
      var delay = 1000, ws = null, closed = false;
      function connect() {
        var token = window.AUTH.get();
        if (!token || closed) return;
        ws = new WebSocket(base().replace(/^http/, "ws") + "/ws?token=" + enc(token));
        ws.onopen = function () { delay = 1000; };
        ws.onmessage = function (ev) {
          try { handler(JSON.parse(ev.data)); } catch (e) { /* mensagem invalida */ }
        };
        ws.onclose = function () {
          if (closed) return;
          setTimeout(connect, delay);
          delay = Math.min(delay * 2, 30000);
        };
      }
      connect();
      return { close: function () { closed = true; if (ws) ws.close(); } };
    }
  };
  window.API = api;
  window.ApiError = ApiError;
})();
