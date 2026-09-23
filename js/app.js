// Orquestra a SPA: header (idioma + fuso + saude), roteamento por hash, filtros, clusters, timeline, mudancas e feed ao vivo.
(function () {
  "use strict";
  window.AUTH.require();
  var U = window.UI;
  var $ = function (sel) { return document.querySelector(sel); };
  var state = { graphData: null, view: "graph", filters: {} };
  var graph, timelineGraph, animated, investigation, compare, detective, guide;

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
  $("#logout").addEventListener("click", function () { window.AUTH.logout(); });
  $("#theme-toggle").addEventListener("click", function () {
    window.THEME.toggle();
    if (graph) graph.applyTheme();
    if (timelineGraph) timelineGraph.applyTheme();
    if (investigation && investigation.graph) investigation.graph.applyTheme();
  });
  $("#menu-toggle").addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
  document.querySelectorAll("[data-nav]").forEach(function (a) {
    a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
  });
  $("#filters-toggle").addEventListener("click", function () { $("#filters").classList.toggle("open"); });

  window.I18N.onChange(function () {
    buildLangSwitch();
    buildTzSelect();
    refreshStats();
    if (animated) animated.relabel();
    if (state.view === "investigation" && investigation.data) investigation.render();
    if (state.view === "compare" && compare.data) compare.open(compare.data.a.name, compare.data.b.name);
    if (state.view === "detective") detective.relabel();
    if (state.view === "changes") loadChanges();
    if (state.view === "clusters") loadClusters();
    if (state.view === "help") guide.render();
    if (window.NOTIFS) window.NOTIFS.render();
    renderHealth(state.health);
  });

  window.TZ.onChange(function () {
    buildTzSelect();
    window.TZ.refresh(document);
    if (window.NOTIFS) window.NOTIFS.render();
    if (state.view === "investigation" && investigation.data) investigation.render();
    if (state.view === "compare" && compare.data) compare.render();
    if (animated) animated.relabel();
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
  }

  function pollHealth() {
    window.API.health().then(function (h) { state.health = h; renderHealth(h); })
      .catch(function () { state.health = null; renderHealth(null); });
  }

  // ------------------------------------------------------------------------------------------ grafo + filtros
  function readFilters() {
    var f = {
      min: +$("#f-min").value / 100, max: +$("#f-max").value / 100,
      window: $("#f-window").value, vocation: $("#f-vocation").value, guild: $("#f-guild").value.trim().toLowerCase(),
      search: $("#f-search").value.trim().toLowerCase(), social: $("#f-social").checked,
      kinds: Array.prototype.map.call(document.querySelectorAll(".f-kind:checked"), function (c) { return c.value; })
    };
    $("#f-min-label").textContent = Math.round(f.min * 100) + "%";
    $("#f-max-label").textContent = Math.round(f.max * 100) + "%";
    return f;
  }

  function edgeFilter(f, untilMs) {
    var nodes = {};
    (state.graphData ? state.graphData.nodes : []).forEach(function (n) { nodes[n.id] = n; });
    var since = f.window === "all" ? 0 : Date.now() - (+f.window) * 864e5;
    function nodeOk(name) {
      var n = nodes[name] || {};
      if (f.vocation && (n.vocation || "").toLowerCase().indexOf(f.vocation) < 0) return false;
      if (f.guild && (n.guild || "").toLowerCase().indexOf(f.guild) < 0) return false;
      return true;
    }
    return function (e) {
      var value = e.confidence || 0;
      if (e.excluded) {
        var socialOk = f.social && e.social >= 0.05;
        if (f.kinds.indexOf("exclusion") < 0 && !socialOk) return false;
      }
      else if (value === 0) { if (!f.social || e.social < 0.05) return false; }
      else if (value < f.min || value > f.max) return false;
      if (f.kinds.length && !(e.kinds || []).some(function (k) { return f.kinds.indexOf(k) >= 0; })) return false;
      var first = Date.parse(e.first_utc || "");
      if (f.window !== "all" && !isNaN(first) && first < since) return false;  // vinculos surgidos na janela
      if (untilMs && !isNaN(first) && first > untilMs) return false;
      if (f.search && e.a.toLowerCase().indexOf(f.search) < 0 && e.b.toLowerCase().indexOf(f.search) < 0) return false;
      return nodeOk(e.a) || nodeOk(e.b);
    };
  }

  function refreshStats() {
    if (!graph || !state.graphData) return;
    var counts = graph.render(edgeFilter(readFilters()));
    var stats = $("#graph-stats");
    stats.innerHTML = "";
    stats.appendChild(U.i18nEl("span", null, "graph.nodes", { count: counts.nodes }));
    stats.appendChild(document.createTextNode(" · "));
    stats.appendChild(U.i18nEl("span", null, "graph.edges", { count: counts.edges }));
    $("#graph-empty").hidden = counts.edges > 0;
  }

  function loadGraph() {
    return window.API.graph({ min: 0 }).then(function (data) {
      state.graphData = data;
      var vocations = {};
      data.nodes.forEach(function (n) { if (n.vocation) vocations[n.vocation] = true; });
      var sel = $("#f-vocation"), cur = sel.value;
      sel.innerHTML = "";
      var all = document.createElement("option");
      all.value = "";
      all.dataset.i18n = "filters.vocation.all";
      all.textContent = t("filters.vocation.all");
      sel.appendChild(all);
      Object.keys(vocations).sort().forEach(function (v) {
        var o = document.createElement("option");
        o.value = v.toLowerCase();
        o.textContent = v;
        sel.appendChild(o);
      });
      sel.value = cur;
      graph.load(data);
      refreshStats();
      if (timelineGraph) { timelineGraph.load(data); animated.setRange(data.edges); }
    }).catch(function (err) { toast(err.message); });
  }

  document.querySelectorAll("#filters input, #filters select").forEach(function (input) {
    input.addEventListener("input", refreshStats);
    input.addEventListener("change", refreshStats);
  });

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
        var show = U.i18nEl("button", "btn", "clusters.show");
        show.addEventListener("click", function () { location.hash = "#graph"; setTimeout(function () { graph.focus(c.members); }, 300); });
        card.appendChild(show);
        out.appendChild(card);
      });
    }).catch(function (err) { out.innerHTML = ""; out.appendChild(U.el("p", "error", err.message)); });
  }

  // ------------------------------------------------------------------------------------------ ultimas 24h
  function loadChanges() {
    var out = $("#changes-list");
    out.innerHTML = "";
    out.appendChild(U.i18nEl("p", "muted", "common.loading"));
    window.API.changes(24).then(function (c) {
      out.innerHTML = "";
      var blocks = [
        ["changes.new_links", c.new_links, function (x) {
          var li = U.stampLine(x.first_utc, t("changes.line.link", x), "transitive");
          li.insertBefore(U.pctBadge(x.confidence || 0), li.firstChild);
          return li;
        }],
        ["changes.relogs", c.relogs, function (x) {
          return U.stampLine(x.login_utc, t("changes.line.relog", { a: x.a, b: x.b, gap: Math.round(x.gap_s) }), "relog");
        }],
        ["changes.exclusions", c.exclusions, function (x) { return U.stampLine(x.seen_together_utc, t("changes.line.exclusion", x), "exclusion"); }],
        ["changes.bans", c.bans, function (x) { return U.stampLine(x.banned_at_utc, t("changes.line.ban", x), "ban"); }],
        ["changes.houses", c.house_changes, function (x) { return U.stampLine(x.first_seen_utc, t("changes.line.house", { owner: x.owner, house: x.name || "" }), "house"); }],
        ["changes.guilds", c.guild_joins, function (x) { return U.stampLine(x.first_seen_utc, t("changes.line.guild", { name: x.name, guild: x.guild || "" }), "guild"); }]
      ];
      blocks.forEach(function (b) {
        var card = U.section(b[0]);
        card.appendChild(U.list(b[1], b[2]));
        out.appendChild(card);
      });
    }).catch(function (err) { out.innerHTML = ""; out.appendChild(U.el("p", "error", err.message)); });
  }

  // ------------------------------------------------------------------------------------------ ao vivo
  var feed = [];
  function toast(text) {
    var box = $("#toasts");
    var el = U.el("div", "toast", text);
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, 5000);
  }

  function liveText(msg) {
    var d = msg.data || {};
    switch (msg.type) {
      case "login": return t("live.login", d);
      case "logout": return t("live.logout", d);
      case "relog": return t("live.relog", { a: d.a, b: d.b, gap: Math.round(d.gap_s) });
      case "death": return t("live.death", d);
      case "exclusion": return t("live.exclusion", d);
      case "ban": return t("live.ban", d);
      case "correlations": return t("live.correlations", d);
      default: return null;
    }
  }

  var reloadTimer = null;
  function onLive(msg) {
    if (msg.type === "poll") { pollHealthSoon(); return; }
    var text = liveText(msg);
    if (!text) return;
    feed.unshift({ at: (msg.data && (msg.data.at || msg.data.login_utc)) || new Date().toISOString(), text: text });
    feed = feed.slice(0, 60);
    renderFeed();
    if (msg.type === "relog" || msg.type === "exclusion") toast(text);
    if (window.NOTIFS) window.NOTIFS.push(msg);
    if (msg.type === "correlations" || msg.type === "exclusion") {
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(loadGraph, 1500);
    }
  }

  var healthTimer = null;
  function pollHealthSoon() {
    if (healthTimer) return;
    healthTimer = setTimeout(function () { healthTimer = null; pollHealth(); }, 3000);
  }

  function renderFeed() {
    var ul = $("#live-feed");
    ul.innerHTML = "";
    feed.forEach(function (f) { ul.appendChild(U.stampLine(f.at, f.text)); });
  }

  // ------------------------------------------------------------------------------------------ rotas
  var VIEWS = ["graph", "investigation", "compare", "clusters", "timeline", "detective", "changes", "help", "notifications"];

  function route() {
    var parts = (location.hash || "#graph").slice(1).split("/").map(decodeURIComponent);
    var view = VIEWS.indexOf(parts[0]) >= 0 ? parts[0] : "graph";
    state.view = view;
    VIEWS.forEach(function (v) {
      $("#view-" + v).hidden = v !== view;
      var nav = document.querySelector('[data-nav="' + v + '"]');
      if (nav) nav.classList.toggle("active", v === view);
    });
    if (view === "graph" && graph) graph.network.redraw();
    if (view === "investigation" && parts[1]) { $("#inv-input").value = parts[1]; investigation.open(parts[1]); }
    if (view === "compare" && parts[1] && parts[2]) compare.open(parts[1], parts[2]);
    if (view === "clusters") loadClusters();
    if (view === "changes") loadChanges();
    if (view === "timeline" && timelineGraph) timelineGraph.network.redraw();
    if (view === "help") guide.open(parseInt(parts[1] || "1", 10) - 1);
    if (view === "notifications" && window.NOTIFS) window.NOTIFS.renderPage();
  }

  $("#inv-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    location.hash = "#investigation/" + encodeURIComponent($("#inv-input").value.trim());
  });
  $("#cmp-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    location.hash = "#compare/" + encodeURIComponent($("#cmp-a").value.trim()) + "/" + encodeURIComponent($("#cmp-b").value.trim());
  });
  $("#export-png").addEventListener("click", function () { window.EXPORT.png(investigation.graph, investigation.current); });
  $("#export-pdf").addEventListener("click", function () {
    if (investigation.current) window.EXPORT.pdf(investigation.current, investigation.graph).catch(function (e) { toast(e.message); });
  });
  $("#graph-export-png").addEventListener("click", function () { window.EXPORT.png(graph, "grafo"); });

  // ------------------------------------------------------------------------------------------ boot
  document.querySelectorAll("[data-icon]").forEach(function (el) { el.innerHTML = window.ICONS.svg(el.dataset.icon); });
  window.I18N.apply(document);
  buildLangSwitch();
  buildTzSelect();
  graph = new window.GRAPH.Graph($("#graph"), function (name) {
    window.UI.sidePanel($("#side-panel"), name);
  });
  timelineGraph = new window.GRAPH.Graph($("#timeline-graph"), function (name) {
    location.hash = "#investigation/" + encodeURIComponent(name);
  });
  animated = new window.TIMELINE.Animated($("#tl-slider"), $("#tl-label"), $("#tl-play"), function (untilMs) {
    if (state.graphData) timelineGraph.render(edgeFilter({ min: 0, max: 1, window: "all", vocation: "", guild: "",
      search: "", social: false, kinds: [] }, untilMs));
  });
  investigation = new window.VIEWS.Investigation($("#view-investigation"));
  compare = new window.VIEWS.Compare($("#view-compare"));
  detective = new window.VIEWS.Detective($("#view-detective"));
  guide = new window.VIEWS.Guide($("#view-help"));
  window.NOTIFS = new window.Notifications($("#notif-toggle"), $("#notif-panel"), $("#notif-list"), $("#notif-badge"), $("#notif-count"),
    $("#view-notifications"));
  window.addEventListener("hashchange", route);
  window.API.verify().then(function () {
    route();
    loadGraph();
    pollHealth();
    setInterval(pollHealth, window.SCANNER_CONFIG.HEALTH_EVERY_MS);
    window.API.live(onLive);
    window.NOTIFS.load();
  }).catch(function () { window.AUTH.logout(); });
})();
