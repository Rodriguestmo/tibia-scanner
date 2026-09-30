// Vista Guildas: busca, ranking por membros e pagina da guilda (membros, ex-membros e vinculos fortes).
(function () {
  "use strict";

  function Guilds(root) {
    this.root = root;
    this.data = null;
  }

  Guilds.prototype.list = function (q) {
    var U = window.UI, out = this.root.querySelector("#guild-result");
    out.innerHTML = "";
    out.appendChild(U.i18nEl("p", "muted", "common.loading"));
    window.API.guilds(q).then(function (res) {
      out.innerHTML = "";
      var card = U.section("guilds.ranking");
      card.appendChild(U.list(res.items, function (g) {
        var li = U.el("li");
        li.appendChild(U.guildLink(g.name));
        li.appendChild(U.i18nEl("span", "muted", "clusters.members", { count: g.members || 0 }));
        return li;
      }));
      out.appendChild(card);
    }).catch(function (err) { out.innerHTML = ""; out.appendChild(U.el("p", "error", err.message)); });
  };

  Guilds.prototype.open = function (name) {
    var self = this, U = window.UI, out = this.root.querySelector("#guild-result");
    out.innerHTML = "";
    out.appendChild(U.i18nEl("p", "muted", "common.loading"));
    window.API.guild(name).then(function (g) { self.data = g; self.render(); })
      .catch(function (err) { out.innerHTML = ""; out.appendChild(U.el("p", "error", err.message)); });
  };

  function member(m) {
    var U = window.UI, li = U.el("li");
    li.appendChild(U.charLink(m.name));
    var info = [m.level ? "Lv " + m.level : "", m.vocation || "", m.rank || ""].filter(Boolean).join(" · ");
    if (info) li.appendChild(U.el("span", "muted", " " + info));
    return li;
  }

  Guilds.prototype.render = function () {
    var g = this.data, U = window.UI, out = this.root.querySelector("#guild-result");
    out.innerHTML = "";
    out.appendChild(U.el("h2", "view-title", g.name));
    var info = U.section("guilds.info");
    info.appendChild(U.kv("guilds.founded", g.founded));
    info.appendChild(U.kv("guilds.members", g.active.length));
    if (g.description) info.appendChild(U.el("p", "muted small", g.description));
    out.appendChild(info);
    var grid = U.el("div", "inv-grid");
    var left = U.el("div", "inv-col"), right = U.el("div", "inv-col");
    var act = U.section("guilds.active", { count: g.active.length });
    act.appendChild(U.list(g.active, member));
    left.appendChild(act);
    var links = U.section("guilds.links", { count: g.links.length });
    links.appendChild(U.list(g.links, function (p) {
      var li = U.el("li");
      li.appendChild(U.pctBadge(p));
      li.appendChild(document.createTextNode(" "));
      li.appendChild(U.charLink(p.a));
      li.appendChild(document.createTextNode(" ~ "));
      li.appendChild(U.charLink(p.b));
      return li;
    }));
    right.appendChild(links);
    var old = U.section("guilds.former", { count: g.former.length });
    old.appendChild(U.list(g.former, function (m) {
      var li = member(m);
      li.appendChild(document.createTextNode(" · "));
      li.appendChild(window.TZ.stamp(m.last_seen_utc, { dateOnly: true }));
      return li;
    }));
    right.appendChild(old);
    grid.appendChild(left);
    grid.appendChild(right);
    out.appendChild(grid);
  };

  window.VIEWS = window.VIEWS || {};
  window.VIEWS.Guilds = Guilds;
})();
