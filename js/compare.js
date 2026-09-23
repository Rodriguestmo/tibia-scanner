// Comparador lado a lado: heatmaps, campos fixos (coincide / nao coincide), guildas em comum e conclusao.
(function () {
  "use strict";
  var FIELDS = ["vocation", "level", "residence", "sex", "account_status", "comment", "loyalty_title", "guild_name", "country"];

  function Compare(root) {
    this.root = root;
    this.data = null;
  }

  Compare.prototype.open = function (a, b) {
    var self = this, U = window.UI;
    this.root.querySelector("#cmp-a").value = a;
    this.root.querySelector("#cmp-b").value = b;
    var out = this.root.querySelector("#cmp-result");
    out.innerHTML = "";
    out.appendChild(U.i18nEl("p", "muted", "common.loading"));
    return window.API.compare(a, b).then(function (data) {
      self.data = data;
      self.render();
    }).catch(function (err) {
      out.innerHTML = "";
      out.appendChild(U.el("p", "error", err.message));
    });
  };

  Compare.prototype.render = function () {
    var d = this.data, U = window.UI;
    var out = this.root.querySelector("#cmp-result");
    out.innerHTML = "";
    var verdict = U.el("div", "card verdict");
    verdict.appendChild(U.pctBadge(d.pair.confidence || d.pair.social, d.pair.social));
    verdict.appendChild(U.el("p", "detective-text", d.pair.detective.conclusion));
    out.appendChild(verdict);
    var cols = U.el("div", "cmp-grid");
    [["a", "heatmap_a"], ["b", "heatmap_b"]].forEach(function (pair) {
      var card = U.el("section", "card");
      card.appendChild(U.el("h3", "card-title", d[pair[0]].name));
      var box = U.el("div");
      card.appendChild(box);
      window.HEATMAP.render(box, d[pair[1]], { rgb: pair[0] === "a" ? null : "91, 155, 213" });
      cols.appendChild(card);
    });
    out.appendChild(cols);
    var table = U.el("table", "diff");
    var head = U.el("tr");
    head.appendChild(U.i18nEl("th", null, "compare.field"));
    head.appendChild(U.el("th", null, d.a.name));
    head.appendChild(U.el("th", null, d.b.name));
    head.appendChild(U.el("th"));
    table.appendChild(head);
    FIELDS.forEach(function (f) {
      var row = U.el("tr", d.diff[f].match ? "match" : "");
      row.appendChild(U.i18nEl("td", null, "field." + f));
      row.appendChild(U.el("td", null, d.diff[f].a === null || d.diff[f].a === undefined ? "—" : d.diff[f].a));
      row.appendChild(U.el("td", null, d.diff[f].b === null || d.diff[f].b === undefined ? "—" : d.diff[f].b));
      row.appendChild(U.i18nEl("td", d.diff[f].match ? "ok" : "muted", d.diff[f].match ? "compare.match" : "compare.mismatch"));
      table.appendChild(row);
    });
    var tcard = U.el("section", "card");
    tcard.appendChild(table);
    out.appendChild(tcard);
    var common = U.section("compare.common_guilds");
    common.appendChild(U.list(d.common_guilds, function (g) { return U.el("li", null, g); }));
    out.appendChild(common);
    var ev = U.section("investigation.evidence");
    ev.appendChild(U.evidenceList(d.pair.evidence));
    out.appendChild(ev);
    var hist = U.el("div", "cmp-grid");
    [d.a, d.b].forEach(function (p) {
      var col = U.el("div");
      col.appendChild(U.profileCard(p));
      col.appendChild(U.historyCards(p));
      hist.appendChild(col);
    });
    out.appendChild(hist);
  };

  window.VIEWS = window.VIEWS || {};
  window.VIEWS.Compare = Compare;
})();
