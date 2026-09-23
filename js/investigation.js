// Vista Investigacao (CSI) + painel lateral do no + utilitarios de renderizacao compartilhados.
(function () {
  "use strict";

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function i18nEl(tag, cls, key, params) {
    var node = el(tag, cls, t(key, params));
    node.dataset.i18n = key;
    if (params) node.dataset.i18nParams = JSON.stringify(params);
    return node;
  }

  function section(titleKey, params) {
    var box = el("section", "card");
    box.appendChild(i18nEl("h3", "card-title", titleKey, params));
    return box;
  }

  function kv(labelKey, value) {
    var row = el("div", "kv");
    row.appendChild(i18nEl("span", "kv-key", labelKey));
    var v = el("span", "kv-value");
    if (value instanceof Node) v.appendChild(value); else v.textContent = value === null || value === undefined || value === "" ? "—" : value;
    row.appendChild(v);
    return row;
  }

  function list(items, render) {
    var ul = el("ul", "list");
    if (!items || !items.length) {
      ul.appendChild(i18nEl("li", "muted", "panel.none"));
      return ul;
    }
    items.forEach(function (it) { ul.appendChild(render(it)); });
    return ul;
  }

  function stampLine(utc, text, icon) {
    var li = el("li", "stamp-line");
    if (icon) li.appendChild(window.ICONS.node(icon));
    li.appendChild(window.TZ.stamp(utc));
    li.appendChild(document.createTextNode(" " + text));
    return li;
  }

  // Recebe o par ({confidence, social, enemy, excluded}): cor e numero seguem a mesma regra das arestas do grafo.
  function pctBadge(p) {
    if (typeof p !== "object" || p === null) p = { confidence: p || 0 };  // so a confianca (clusters, listas)
    var b = el("span", "badge");
    b.textContent = window.GRAPH.pct(window.GRAPH.pairValue(p));
    b.style.background = window.GRAPH.edgeColor(p);
    return b;
  }

  function profileCard(p, onTarget) {
    var card = section("panel.profile");
    var head = el("div", "profile-head");
    head.appendChild(el("strong", "profile-name", p.name));
    head.appendChild(i18nEl("span", p.online ? "pill pill-on" : "pill", p.online ? "panel.online" : "panel.offline"));
    card.appendChild(head);
    card.appendChild(kv("panel.level", p.level));
    card.appendChild(kv("panel.vocation", p.vocation));
    card.appendChild(kv("panel.residence", p.residence));
    card.appendChild(kv("panel.guild", p.guild_name ? p.guild_name + (p.guild_rank ? " (" + p.guild_rank + ")" : "") : ""));
    card.appendChild(kv("panel.status", p.account_status));
    card.appendChild(kv("panel.last_login", window.TZ.stamp(p.last_login_utc)));
    card.appendChild(kv("panel.first_seen", window.TZ.stamp(p.first_seen_utc)));
    card.appendChild(i18nEl("p", "muted small", "panel.sessions", { count: p.sessions || 0 }));
    if (onTarget) {
      var btn = i18nEl("button", "btn", p.is_target ? "panel.untarget" : "panel.target");
      btn.addEventListener("click", function () { onTarget(!p.is_target); });
      card.appendChild(btn);
    }
    return card;
  }

  function historyCards(p) {
    var frag = document.createDocumentFragment();
    var g = section("panel.guilds");
    g.appendChild(list(p.guild_history, function (x) {
      var li = el("li");
      li.appendChild(el("strong", null, x.guild || String(x.guild_id)));
      li.appendChild(document.createTextNode(" " + (x.rank || "") + " · "));
      li.appendChild(window.TZ.stamp(x.first_seen_utc, { dateOnly: true }));
      li.appendChild(document.createTextNode(" → "));
      if (x.active) li.appendChild(i18nEl("span", "muted", "panel.active"));
      else li.appendChild(window.TZ.stamp(x.last_seen_utc, { dateOnly: true }));
      return li;
    }));
    frag.appendChild(g);
    var h = section("panel.houses");
    h.appendChild(list(p.houses, function (x) {
      var li = el("li", null, (x.name || x.house_id) + (x.town ? " · " + x.town : "") + " · ");
      li.appendChild(window.TZ.stamp(x.first_seen_utc, { dateOnly: true }));
      return li;
    }));
    frag.appendChild(h);
    var b = section("panel.bans");
    b.appendChild(list(p.bans, function (x) { return stampLine(x.banned_at_utc, x.reason + (x.gm ? " · " + x.gm : "")); }));
    frag.appendChild(b);
    var d = section("panel.deaths");
    d.appendChild(list((p.deaths || []).slice(0, 15), function (x) { return stampLine(x.died_utc, x.raw); }));
    frag.appendChild(d);
    var k = section("panel.kills");
    k.appendChild(list((p.kills || []).slice(0, 15), function (x) { return stampLine(x.died_utc, x.victim + " (" + x.level + ")"); }));
    frag.appendChild(k);
    return frag;
  }

  function evidenceList(evidence) {
    var wrap = el("div", "evidence");
    (evidence || []).forEach(function (e) {
      var item = el("details", "evidence-item");
      var sum = el("summary");
      var icon = window.ICONS.node(e.icon || "metadata");
      icon.classList.add("ev-icon");
      sum.appendChild(icon);
      sum.appendChild(el("span", "ev-text", e.text || e.reason));
      sum.appendChild(el("span", "ev-weight muted", e.module === "exclusion" ? "" : "+" + window.GRAPH.pct(e.llr)));
      item.appendChild(sum);
      if (e.raw && e.raw.length) {
        var pre = el("div", "raw");
        pre.appendChild(i18nEl("div", "muted small", "investigation.raw"));
        e.raw.forEach(function (line) { pre.appendChild(rawLine(line)); });
        item.appendChild(pre);
      }
      wrap.appendChild(item);
    });
    return wrap;
  }

  // Linhas cruas comecam com timestamps UTC ISO; convertidos para o fuso escolhido.
  function rawLine(line) {
    var div = el("div", "raw-line");
    var re = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g, last = 0, m;
    while ((m = re.exec(line))) {
      div.appendChild(document.createTextNode(line.slice(last, m.index)));
      div.appendChild(window.TZ.stamp(m[0], { seconds: true }));
      last = m.index + m[0].length;
    }
    div.appendChild(document.createTextNode(line.slice(last)));
    return div;
  }

  function Investigation(root, deps) {
    this.root = root;
    this.deps = deps;
    this.current = null;
    this.graph = null;
  }

  Investigation.prototype.open = function (name) {
    var self = this;
    if (!name) return;
    this.current = name;
    var out = this.root.querySelector("#inv-result");
    out.innerHTML = "";
    out.appendChild(i18nEl("p", "muted", "common.loading"));
    return window.API.investigation(name).then(function (data) {
      self.data = data;
      self.render();
    }).catch(function (err) {
      out.innerHTML = "";
      out.appendChild(el("p", "error", err.message || String(err)));
    });
  };

  Investigation.prototype.render = function () {
    var data = this.data, self = this;
    var out = this.root.querySelector("#inv-result");
    out.innerHTML = "";
    out.appendChild(i18nEl("h2", "view-title", "investigation.title", { char: data.profile.name }));
    var grid = el("div", "inv-grid");
    var left = el("div", "inv-col");
    left.appendChild(profileCard(data.profile, function (on) {
      window.API.setTarget(data.profile.name, on).then(function () { self.open(self.current); });
    }));
    var hm = section("panel.heatmap");
    var hmBox = el("div");
    hm.appendChild(hmBox);
    window.HEATMAP.render(hmBox, data.heatmap);
    left.appendChild(hm);
    var tl = section("timeline.sessions");
    var tlBox = el("div");
    tl.appendChild(tlBox);
    window.TIMELINE.renderSessions(tlBox, data.timeline.sessions);
    left.appendChild(tl);
    left.appendChild(historyCards(data.profile));
    var right = el("div", "inv-col");
    var gcard = section("nav.graph");
    var gbox = el("div", "mini-graph");
    gcard.appendChild(gbox);
    right.appendChild(gcard);
    var sus = section("investigation.suspects", { count: data.suspects.length });
    if (!data.suspects.length) sus.appendChild(i18nEl("p", "muted", "investigation.no_suspects"));
    data.suspects.forEach(function (s) {
      var item = el("div", "suspect");
      var head = el("div", "suspect-head");
      head.appendChild(pctBadge(s));
      var link = el("a", "suspect-name", s.other);
      link.href = "#investigation/" + encodeURIComponent(s.other);
      head.appendChild(link);
      item.appendChild(head);
      item.appendChild(el("p", "detective-text", s.detective.conclusion));
      item.appendChild(evidenceList(s.evidence));
      sus.appendChild(item);
    });
    right.appendChild(sus);
    var ex = section("investigation.excluded");
    ex.appendChild(list(data.excluded, function (x) {
      return stampLine(x.seen_together_utc, (x.a === data.profile.name ? x.b : x.a), "exclusion");
    }));
    right.appendChild(ex);
    grid.appendChild(left);
    grid.appendChild(right);
    out.appendChild(grid);
    this.graph = new window.GRAPH.Graph(gbox, function (name) { location.hash = "#investigation/" + encodeURIComponent(name); });
    this.graph.load(data.graph);
  };

  // Painel lateral do grafo: ficha completa + heatmap + evidencias do par com o no selecionado antes.
  function sidePanel(panel, name, onClose) {
    panel.innerHTML = "";
    panel.classList.add("open");
    var head = el("div", "panel-head");
    head.appendChild(el("h2", null, name));
    var close = i18nEl("button", "btn btn-ghost", "panel.close");
    close.addEventListener("click", function () { panel.classList.remove("open"); if (onClose) onClose(); });
    head.appendChild(close);
    panel.appendChild(head);
    var body = el("div", "panel-body");
    body.appendChild(i18nEl("p", "muted", "common.loading"));
    panel.appendChild(body);
    Promise.all([window.API.character(name), window.API.heatmap(name), window.API.correlations({ char: name, limit: 20 })])
      .then(function (res) {
        var p = res[0];
        body.innerHTML = "";
        var inv = i18nEl("a", "btn btn-primary", "panel.investigate");
        inv.href = "#investigation/" + encodeURIComponent(name);
        body.appendChild(inv);
        body.appendChild(profileCard(p, function (on) {
          window.API.setTarget(name, on).then(function () { sidePanel(panel, name, onClose); });
        }));
        var hm = section("panel.heatmap");
        var box = el("div");
        hm.appendChild(box);
        window.HEATMAP.render(box, res[1].vector);
        body.appendChild(hm);
        var ev = section("panel.evidence");
        ev.appendChild(list(res[2].items, function (c) {
          var other = c.a === name ? c.b : c.a;
          var li = el("li");
          li.appendChild(pctBadge(c));
          var a = el("a", null, " " + other + " ");
          a.href = "#compare/" + encodeURIComponent(name) + "/" + encodeURIComponent(other);
          li.appendChild(a);
          var kinds = el("span", "kinds muted");
          (c.kinds || "").split(",").filter(Boolean).forEach(function (k) {
            var ic = window.ICONS.node(k);
            ic.title = t("graph.evidence." + k);
            kinds.appendChild(ic);
          });
          li.appendChild(kinds);
          return li;
        }));
        body.appendChild(ev);
        body.appendChild(historyCards(p));
      })
      .catch(function (err) { body.innerHTML = ""; body.appendChild(el("p", "error", err.message)); });
  }

  // Painel lateral de um PAR (notificacoes): veredito, explicacao, evidencias e atalhos para cada ficha.
  function pairPanel(panel, a, b) {
    panel.innerHTML = "";
    panel.classList.add("open");
    var head = el("div", "panel-head");
    head.appendChild(el("h2", null, a + " / " + b));
    var close = i18nEl("button", "btn btn-ghost", "panel.close");
    close.addEventListener("click", function () { panel.classList.remove("open"); });
    head.appendChild(close);
    panel.appendChild(head);
    var body = el("div", "panel-body");
    body.appendChild(i18nEl("p", "muted", "common.loading"));
    panel.appendChild(body);
    window.API.pair(a, b).then(function (pair) {
      body.innerHTML = "";
      var verdict = el("section", "card");
      var top = el("div", "suspect-head");
      top.appendChild(pctBadge(pair));
      verdict.appendChild(top);
      verdict.appendChild(el("p", "detective-text", pair.detective.conclusion));
      body.appendChild(verdict);
      var actions = el("div", "panel-actions");
      [a, b].forEach(function (name) {
        var btn = i18nEl("button", "btn", "panel.open_profile", { name: name });
        btn.addEventListener("click", function () { sidePanel(panel, name); });
        actions.appendChild(btn);
      });
      var cmp = i18nEl("a", "btn btn-primary", "panel.open_compare");
      cmp.href = "#compare/" + encodeURIComponent(a) + "/" + encodeURIComponent(b);
      cmp.addEventListener("click", function () { panel.classList.remove("open"); });
      actions.appendChild(cmp);
      body.appendChild(actions);
      var ev = section("panel.evidence");
      ev.appendChild(pair.evidence.length ? evidenceList(pair.evidence) : i18nEl("p", "muted", "panel.none"));
      body.appendChild(ev);
    }).catch(function (err) { body.innerHTML = ""; body.appendChild(el("p", "error", err.message)); });
  }

  window.VIEWS = window.VIEWS || {};
  window.VIEWS.Investigation = Investigation;
  window.UI = { el: el, i18nEl: i18nEl, section: section, kv: kv, list: list, stampLine: stampLine, pctBadge: pctBadge,
    profileCard: profileCard, historyCards: historyCards, evidenceList: evidenceList, sidePanel: sidePanel,
    pairPanel: pairPanel };
})();
