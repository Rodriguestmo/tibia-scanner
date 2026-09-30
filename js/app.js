// Orquestra a SPA: header (idioma + fuso + saude), roteamento por hash e clusters.
(function () {
  "use strict";
  var U = window.UI;
  var $ = function (sel) { return document.querySelector(sel); };
  var state = { view: "investigation" };
  var investigation, compare, guilds, lists;

  // ------------------------------------------------------------------------------------------ header
  function buildLangSwitch() {
    var box = $("#lang-switch");
    box.innerHTML = "";
    [["pt-BR", "PT"], ["en", "EN"], ["sv", "SV"]].forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lang-btn" + (window.I18N.locale() === l[0] ? " active" : "");
      b.innerHTML = window.ICONS.FLAGS[l[0]] + "<span>" + l[1] + "</span>";
      b.setAttribute("aria-pressed", window.I18N.locale() === l[0]);
      b.addEventListener("click", function () { window.I18N.setLocale(l[0]); });
      box.appendChild(b);
    });
  }

  function buildTzSelect() {
    var sel = $("#tz-select");
    var value = window.TZ.current();
    sel.innerHTML = "";
    window.TZ.zones.forEach(function (z) {
      var o = document.createElement("option");
      o.value = z.id;
      o.textContent = t(z.key);
      sel.appendChild(o);
    });
    sel.value = value;
    var zone = window.TZ.zones.filter(function (z) { return z.id === value; })[0];
    $("#tz-icon").innerHTML = zone && zone.flag ? window.ICONS.FLAGS[zone.flag] : window.ICONS.svg("clock");
    $("#tz-offset").textContent = window.TZ.offsetLabel();
  }

  $("#tz-select").addEventListener("change", function (ev) { window.TZ.setTimezone(ev.target.value); });
  $("#theme-toggle").addEventListener("click", function () {
    window.THEME.toggle();
    if (timelineGraph) timelineGraph.applyTheme();
    if (investigation && investigation.graph) investigation.graph.applyTheme();
  });
  $("#menu-toggle").addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
  document.querySelectorAll("[data-nav]").forEach(function (a) {
    a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
  });

  window.I18N.onChange(function () {
    buildLangSwitch();
    buildTzSelect();
    if (state.view === "investigation" && investigation.data) investigation.render();
    if (state.view === "compare" && compare.data) compare.open(compare.data.a.name, compare.data.b.name);
    if (state.view === "clusters") loadClusters();
    if (LISTS.indexOf(state.view) >= 0) lists.open(state.view);
    if (state.view === "guilds" && guilds.data && location.hash.indexOf("#guilds/") === 0) guilds.render();
    renderHealth(state.health);
  });

  window.TZ.onChange(function () {
    buildTzSelect();
    window.TZ.refresh(document);
    if (state.view === "investigation" && investigation.data) investigation.render();
    if (state.view === "compare" && compare.data) compare.render();
    renderHealth(state.health);
  });

  // ------------------------------------------------------------------------------------------ saude
  function renderHealth(h) {
    var dot = $("#health-dot"), label = $("#health-label");
    var status = h ? h.status : "down";
    dot.className = "dot " + (status === "ok" ? "ok" : status === "degraded" ? "warn" : "bad");
    label.dataset.i18n = status === "ok" ? "health.online" : status === "degraded" ? "health.degraded" : "health.offline";
    label.textContent = t(label.dataset.i18n);
    var tip = [];
    if (h && h.servers) {
      Object.keys(h.servers).forEach(function (k) {
        var s = h.servers[k];
        if (s.last_poll && s.last_poll.whoisonline) {
          tip.push(t("health.last_poll", { time: window.TZ.formatDateTime(s.last_poll.whoisonline, { seconds: true }) }));
        }
        if (s.scheduler) tip.push(t("health.mode", { mode: s.scheduler.mode, interval: s.scheduler.interval }));
      });
    }
    $("#health").title = tip.join("\n");
    var total = null;
    if (h && h.servers) Object.keys(h.servers).forEach(function (k) {
      if (typeof h.servers[k].online === "number") total = (total || 0) + h.servers[k].online;
    });
    var oc = $("#online-count");
    oc.hidden = total === null;
    if (total !== null) oc.textContent = t("lists.online_count", { count: total });
  }

  function pollHealth() {
    window.API.health().then(function (h) { state.health = h; renderHealth(h); })
      .catch(function () { state.health = null; renderHealth(null); });
  }

  // ------------------------------------------------------------------------------------------ grafo + filtros
  // ------------------------------------------------------------------------------------------ clusters
  function loadClusters() {
    var out = $("#clusters-list");
    out.innerHTML = "";
    out.appendChild(U.i18nEl("p", "muted", "common.loading"));
    window.API.clusters().then(function (res) {
      out.innerHTML = "";
      if (!res.items.length) { out.appendChild(U.i18nEl("p", "muted", "clusters.empty")); return; }
      res.items.forEach(function (c, i) {
        var card = U.el("section", "card cluster");
        var head = U.el("div", "suspect-head");
        head.appendChild(U.el("strong", null, "#" + (i + 1)));
        head.appendChild(U.pctBadge(c.avg_confidence));
        head.appendChild(U.i18nEl("span", "muted", "clusters.members", { count: c.size }));
        head.appendChild(U.i18nEl("span", "muted", "clusters.score", { score: c.score.toFixed(2) }));
        card.appendChild(head);
        var names = U.el("div", "chips");
        c.members.forEach(function (m) {
          var a = U.el("a", "chip", m);
          a.href = "#investigation/" + encodeURIComponent(m);
          names.appendChild(a);
        });
        card.appendChild(names);
        out.appendChild(card);
      });
    }).catch(function (err) { out.innerHTML = ""; out.appendChild(U.el("p", "error", err.message)); });
  }

  function toast(text) {
    var box = $("#toasts");
    var el = U.el("div", "toast", text);
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, 5000);
  }

  // ------------------------------------------------------------------------------------------ rotas
  var LISTS = ["highscores", "online", "powergamers", "insomniacs", "deaths", "bans"];
  var VIEWS = ["investigation", "guilds", "compare", "clusters"].concat(LISTS);

  function route() {
    var parts = (location.hash || "#investigation").slice(1).split("/").map(decodeURIComponent);
    var view = VIEWS.indexOf(parts[0]) >= 0 ? parts[0] : "investigation";
    state.view = view;
    VIEWS.forEach(function (v) {
      $("#view-" + v).hidden = v !== view;
      var nav = document.querySelector('[data-nav="' + v + '"]');
      if (nav) nav.classList.toggle("active", v === view);
    });
    if (view === "investigation" && parts[1]) { $("#inv-input").value = parts[1]; investigation.open(parts[1]); }
    if (view === "guilds") { if (parts[1]) { $("#guild-input").value = parts[1]; guilds.open(parts[1]); } else guilds.list($("#guild-input").value.trim()); }
    if (LISTS.indexOf(view) >= 0) lists.open(view, parts[1]);
    if (view === "compare" && parts[1] && parts[2]) compare.open(parts[1], parts[2]);
    if (view === "clusters") loadClusters();
  }

  $("#inv-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    location.hash = "#investigation/" + encodeURIComponent($("#inv-input").value.trim());
  });
  $("#guild-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var q = $("#guild-input").value.trim();
    if (location.hash === "#guilds") guilds.list(q); else location.hash = "#guilds";
  });
  $("#cmp-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    location.hash = "#compare/" + encodeURIComponent($("#cmp-a").value.trim()) + "/" + encodeURIComponent($("#cmp-b").value.trim());
  });
  $("#export-png").addEventListener("click", function () { window.EXPORT.png(investigation.graph, investigation.current); });
  $("#export-pdf").addEventListener("click", function () {
    if (investigation.current) window.EXPORT.pdf(investigation.current, investigation.graph).catch(function (e) { toast(e.message); });
  });

  // ------------------------------------------------------------------------------------------ boot
  document.querySelectorAll("[data-icon]").forEach(function (el) { el.innerHTML = window.ICONS.svg(el.dataset.icon); });
  window.I18N.apply(document);
  buildLangSwitch();
  buildTzSelect();
  investigation = new window.VIEWS.Investigation($("#view-investigation"));
  compare = new window.VIEWS.Compare($("#view-compare"));
  guilds = new window.VIEWS.Guilds($("#view-guilds"));
  lists = new window.VIEWS.Lists();
  window.addEventListener("hashchange", route);
  // Painel publico (sem login) e sem WebSocket: a API publica so atende leitura (2026-09-29).
  route();
  pollHealth();
  setInterval(pollHealth, window.SCANNER_CONFIG.HEALTH_EVERY_MS);
})();
