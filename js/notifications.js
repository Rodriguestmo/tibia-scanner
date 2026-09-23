// Sino do topo: guarda as ultimas 100 notificacoes (historico do servidor + ao vivo); o painel mostra as 10 mais
// recentes e "Ver mais" abre a pagina #notifications com as 100.
(function () {
  "use strict";
  var LIMIT = 100, PANEL = 10, SEEN_KEY = "notif_seen_utc";
  var ICON = { relog: "relog", link: "transitive", exclusion: "exclusion", ban: "ban" };

  function Notifications(button, panel, list, badge, count, page) {
    this.button = button; this.panel = panel; this.list = list; this.badge = badge; this.count = count;
    this.page = page;
    this.items = [];
    try { this.seen = localStorage.getItem(SEEN_KEY) || ""; } catch (e) { this.seen = ""; }
    var self = this;
    button.addEventListener("click", function (ev) { ev.stopPropagation(); self.toggle(); });
    panel.addEventListener("click", function (ev) { ev.stopPropagation(); });
    document.addEventListener("click", function () { self.close(); });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") self.close(); });
  }

  Notifications.prototype.load = function () {
    var self = this;
    return window.API.notifications(LIMIT).then(function (res) {
      self.items = res.items || [];
      self.render();
    }).catch(function () { /* sem historico: fica so o ao vivo */ });
  };

  // Evento do WebSocket -> mesmo formato do historico.
  Notifications.prototype.push = function (msg) {
    var d = msg.data || {}, item = null;
    if (msg.type === "relog") item = { type: "relog", at: d.login_utc, a: d.a, b: d.b, gap: Math.round(d.gap_s || 0) };
    else if (msg.type === "exclusion") item = { type: "exclusion", at: d.at, a: d.a, b: d.b };
    else if (msg.type === "ban") item = { type: "ban", at: d.at, name: d.name, reason: d.reason };
    if (!item) return;
    this.items.unshift(item);
    this.items = this.items.slice(0, LIMIT);
    this.render();
  };

  Notifications.prototype.text = function (n) {
    if (n.type === "relog") return t("changes.line.relog", { a: n.a, b: n.b, gap: n.gap });
    if (n.type === "link") return t("notif.link", { a: n.a, b: n.b, pct: window.GRAPH.pct(n.confidence) });
    if (n.type === "exclusion") return t("changes.line.exclusion", n);
    return t("changes.line.ban", n);
  };

  Notifications.prototype.link = function (n) {
    if (n.a && n.b) return "#compare/" + encodeURIComponent(n.a) + "/" + encodeURIComponent(n.b);
    return "#investigation/" + encodeURIComponent(n.name || "");
  };

  Notifications.prototype.unread = function () {
    var seen = this.seen;
    return this.items.filter(function (n) { return (n.at || "") > seen; }).length;
  };

  Notifications.prototype.render = function () {
    var self = this, unread = this.unread();
    this.badge.hidden = unread === 0;
    this.badge.textContent = unread > 99 ? "99+" : String(unread);
    this.count.textContent = t("notif.count", { count: Math.min(PANEL, this.items.length) });
    this.fill(this.list, this.items.slice(0, PANEL));
    if (this.items.length > PANEL) {
      var more = document.createElement("li");
      more.className = "notif-more";
      var a = document.createElement("a");
      a.className = "btn";
      a.href = "#notifications";
      a.textContent = t("notif.more", { count: this.items.length });
      a.addEventListener("click", function () { self.close(); });
      more.appendChild(a);
      this.list.appendChild(more);
    }
    if (this.page && !this.page.hidden) this.renderPage();
  };

  // Pagina completa (#notifications) com as 100.
  Notifications.prototype.renderPage = function () {
    var root = this.page;
    root.innerHTML = "";
    var title = document.createElement("h2");
    title.className = "view-title";
    title.textContent = t("notif.all_title", { count: this.items.length });
    root.appendChild(title);
    var card = document.createElement("section");
    card.className = "card";
    var ul = document.createElement("ul");
    ul.className = "list notif-list notif-page";
    card.appendChild(ul);
    root.appendChild(card);
    this.fill(ul, this.items);
  };

  Notifications.prototype.fill = function (ul, items) {
    var self = this;
    ul.innerHTML = "";
    if (!items.length) {
      var empty = document.createElement("li");
      empty.className = "muted";
      empty.textContent = t("notif.empty");
      ul.appendChild(empty);
      return;
    }
    items.forEach(function (n) {
      var li = document.createElement("li");
      if ((n.at || "") > self.seen) li.className = "unread";
      li.appendChild(window.ICONS.node(ICON[n.type] || "bell"));
      var body = document.createElement("a");
      body.href = self.link(n);
      var text = document.createElement("span");
      text.className = "notif-text";
      text.textContent = self.text(n);
      body.appendChild(text);
      body.appendChild(window.TZ.stamp(n.at, { seconds: true }));
      // Clique abre a barra lateral (par ou personagem); ctrl/cmd+clique ainda abre a pagina pelo link.
      body.addEventListener("click", function (ev) {
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
        ev.preventDefault();
        self.close();
        var side = document.getElementById("side-panel");
        if (n.a && n.b) window.UI.pairPanel(side, n.a, n.b);
        else window.UI.sidePanel(side, n.name);
      });
      li.appendChild(body);
      ul.appendChild(li);
    });
  };

  Notifications.prototype.toggle = function () { if (this.panel.hidden) this.open(); else this.close(); };

  Notifications.prototype.open = function () {
    this.panel.hidden = false;
    this.button.setAttribute("aria-expanded", "true");
    this.render();
    // Abriu = leu: o contador zera, mas os itens continuam destacados ate fechar.
    var newest = this.items.length ? this.items[0].at : "";
    if (newest && newest > this.seen) {
      this.seen = newest;
      try { localStorage.setItem(SEEN_KEY, newest); } catch (e) { /* ignore */ }
    }
    this.badge.hidden = true;
  };

  Notifications.prototype.close = function () {
    if (this.panel.hidden) return;
    this.panel.hidden = true;
    this.button.setAttribute("aria-expanded", "false");
    this.render();
  };

  window.Notifications = Notifications;
})();
