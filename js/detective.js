// Modo Detetive: pergunta em linguagem natural ("A e B", "A and B?", "A och B", "A vs B") -> explicacao do backend.
(function () {
  "use strict";

  // Extrai dois nomes. Nomes de Tibia tem espacos, entao separamos pelos conectivos dos 3 idiomas.
  function parseNames(text) {
    var clean = String(text || "")
      .replace(/[?¿!."“”]/g, " ")
      .replace(/^\s*(quem|who|vem|é|e|is|are|är|sao|são|será|seria)\b.*?:\s*/i, "")
      .trim();
    var parts = clean.split(/\s+(?:e|and|och|vs\.?|x|versus|com|with|med)\s+|\s*[,;/|]\s*/i)
      .map(function (s) { return s.replace(/\s+/g, " ").trim(); })
      .filter(Boolean);
    return parts.length >= 2 ? [parts[0], parts[1]] : null;
  }

  function Detective(root) {
    this.root = root;
    this.last = null;
    var self = this;
    root.querySelector("#det-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      self.ask(root.querySelector("#det-input").value);
    });
  }

  Detective.prototype.ask = function (text) {
    var U = window.UI, self = this;
    var out = this.root.querySelector("#det-result");
    var names = parseNames(text);
    out.innerHTML = "";
    if (!names) {
      out.appendChild(U.i18nEl("p", "error", "detective.need_two"));
      return;
    }
    this.last = text;
    out.appendChild(U.i18nEl("p", "muted", "common.loading"));
    window.API.pair(names[0], names[1]).then(function (pair) {
      out.innerHTML = "";
      var card = U.el("section", "card");
      card.appendChild(U.i18nEl("h3", "card-title", "detective.conclusion"));
      var head = U.el("div", "suspect-head");
      head.appendChild(U.pctBadge(pair));
      card.appendChild(head);
      card.appendChild(U.el("p", "detective-text big", pair.detective.conclusion));
      if (pair.detective.reasons && pair.detective.reasons.length) {
        card.appendChild(U.i18nEl("h3", "card-title", "detective.explanation"));
        var ol = U.el("ol");
        pair.detective.reasons.forEach(function (r) { ol.appendChild(U.el("li", null, r)); });
        card.appendChild(ol);
      }
      card.appendChild(U.evidenceList(pair.evidence));
      out.appendChild(card);
    }).catch(function (err) {
      out.innerHTML = "";
      out.appendChild(U.el("p", "error", err.message));
    });
  };

  Detective.prototype.relabel = function () { if (this.last) this.ask(this.last); };

  window.VIEWS = window.VIEWS || {};
  window.VIEWS.Detective = Detective;
  window.DETECTIVE = { parseNames: parseNames };
})();
