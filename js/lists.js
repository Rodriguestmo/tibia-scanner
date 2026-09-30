// Listas do servidor: quem esta online, powergamers, insomniacs, ultimas mortes e bans. Todo nome leva ao perfil.
(function () {
  "use strict";

  var PERIODS = ["today", "lastday", "last7days"];

  function table(heads, rows) {
    var U = window.UI, t = U.el("table", "diff list-table");
    var tr = U.el("tr");
    heads.forEach(function (h) { tr.appendChild(U.i18nEl("th", null, h)); });
    t.appendChild(tr);
    rows.forEach(function (cells) {
      var row = U.el("tr");
      cells.forEach(function (c) {
        var td = U.el("td");
        if (c instanceof Node) td.appendChild(c); else td.textContent = c === null || c === undefined || c === "" ? "—" : c;
        row.appendChild(td);
      });
      t.appendChild(row);
    });
    return t;
  }

  function guild(name) { return name ? window.UI.guildLink(name) : ""; }

  var RENDER = {
    online: function (res) {
      return table(["lists.name", "panel.level", "panel.vocation", "panel.guild", "lists.since"], res.items.map(function (r) {
        return [window.UI.charLink(r.name), r.level, r.vocation, guild(r.guild_name), window.TZ.stamp(r.login_utc)];
      }));
    },
    ranking: function (res, kind) {
      return table(["lists.rank", "lists.name", "panel.vocation", "panel.level", "lists." + kind], res.items.map(function (r) {
        return [r.rank, window.UI.charLink(r.name), r.vocation, r.level, r.value];
      }));
    },
    deaths: function (res) {
      var U = window.UI;
      return table(["lists.when", "lists.name", "panel.level", "lists.killers"], res.items.map(function (r) {
        var parts = [];
        r.killers.forEach(function (k, i) {
          if (i) parts.push(", ");
          parts.push(k.player ? U.charLink(k.name) : k.name);
        });
        return [window.TZ.stamp(r.died_utc), U.charLink(r.victim), r.level, parts.length ? U.frag(parts) : r.raw];
      }));
    },
    bans: function (res) {
      return table(["lists.when", "lists.name", "panel.level", "lists.reason", "lists.expires", "lists.gm"], res.items.map(function (r) {
        return [window.TZ.stamp(r.banned_at_utc), window.UI.charLink(r.name), r.level, r.reason,
          r.expires_at_utc ? window.TZ.stamp(r.expires_at_utc) : "", r.gm];
      }));
    }
  };

  function Lists() { this.period = "today"; }

  // view: online | powergamers | insomniacs | deaths | bans
  Lists.prototype.open = function (view, period) {
    var U = window.UI, self = this, root = document.getElementById("view-" + view);
    var ranking = view === "powergamers" || view === "insomniacs";
    if (period && PERIODS.indexOf(period) >= 0) this.period = period;
    root.innerHTML = "";
    var head = U.el("div", "search-bar");
    head.appendChild(U.i18nEl("h2", "view-title", "nav." + view));
    if (ranking) {
      PERIODS.forEach(function (p) {
        var b = U.i18nEl("a", "btn" + (p === self.period ? " btn-primary" : ""), "lists.period." + p);
        b.href = "#" + view + "/" + p;
        head.appendChild(b);
      });
    }
    root.appendChild(head);
    var out = U.el("div", "card");
    out.appendChild(U.i18nEl("p", "muted", "common.loading"));
    root.appendChild(out);
    var req = ranking ? window.API.rankings(view, this.period) : window.API[view]();
    req.then(function (res) {
      out.innerHTML = "";
      if (view === "online") out.appendChild(U.i18nEl("p", "muted small", "lists.online_count", { count: res.items.length }));
      if (ranking && res.fetched_utc) {
        var upd = U.i18nEl("p", "muted small", "lists.updated");
        upd.appendChild(document.createTextNode(" "));
        upd.appendChild(window.TZ.stamp(res.fetched_utc));
        out.appendChild(upd);
      }
      if (!res.items.length) { out.appendChild(U.i18nEl("p", "muted", "panel.none")); return; }
      out.appendChild(ranking ? RENDER.ranking(res, view) : RENDER[view](res));
    }).catch(function (err) { out.innerHTML = ""; out.appendChild(U.el("p", "error", err.message)); });
  };

  window.VIEWS = window.VIEWS || {};
  window.VIEWS.Lists = Lists;
})();
