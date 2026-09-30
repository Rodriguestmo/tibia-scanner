// Listas do servidor: quem esta online, powergamers, insomniacs, ultimas mortes e bans. Todo nome leva ao perfil.
(function () {
  "use strict";

  var PERIODS = ["today", "lastday", "last7days"];
  var CATEGORIES = ["experience", "maglevel", "fist", "club", "sword", "axe", "dist", "shielding", "fishing",
    "alchemy", "cooking", "crafting", "farming", "mining", "skinning"];

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
    highscores: function (res, cat) {
      return table(["lists.rank", "lists.name", "panel.vocation", "panel.level", "skill." + cat], res.items.map(function (r) {
        return [r.rank, window.UI.charLink(r.name), r.vocation, r.level,
          cat === "experience" ? r.value.toLocaleString() : r.value];
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

  function Lists() { this.period = "today"; this.category = "experience"; }

  // view: online | powergamers | insomniacs | deaths | bans
  Lists.prototype.open = function (view, period) {
    var U = window.UI, self = this, root = document.getElementById("view-" + view);
    var ranking = view === "powergamers" || view === "insomniacs";
    var hs = view === "highscores";
    if (period && PERIODS.indexOf(period) >= 0) this.period = period;
    if (hs && period && CATEGORIES.indexOf(period) >= 0) this.category = period;
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
    if (hs) {
      var sel = U.el("select");
      CATEGORIES.forEach(function (c) {
        var o = U.i18nEl("option", null, "skill." + c);
        o.value = c;
        if (c === self.category) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () { location.hash = "#highscores/" + sel.value; });
      head.appendChild(sel);
    }
    root.appendChild(head);
    var out = U.el("div", "card");
    out.appendChild(U.i18nEl("p", "muted", "common.loading"));
    root.appendChild(out);
    var req = ranking ? window.API.rankings(view, this.period) : hs ? window.API.highscores(this.category) : window.API[view]();
    req.then(function (res) {
      out.innerHTML = "";
      if (view === "online") out.appendChild(U.i18nEl("p", "muted small", "lists.online_count", { count: res.items.length }));
      if ((ranking || hs) && res.fetched_utc) {
        var upd = U.i18nEl("p", "muted small", "lists.updated");
        upd.appendChild(document.createTextNode(" "));
        upd.appendChild(window.TZ.stamp(res.fetched_utc));
        out.appendChild(upd);
      }
      if (!res.items.length) { out.appendChild(U.i18nEl("p", "muted", "panel.none")); return; }
      out.appendChild(ranking ? RENDER.ranking(res, view) : hs ? RENDER.highscores(res, self.category) : RENDER[view](res));
    }).catch(function (err) { out.innerHTML = ""; out.appendChild(U.el("p", "error", err.message)); });
  };

  window.VIEWS = window.VIEWS || {};
  window.VIEWS.Lists = Lists;
})();
