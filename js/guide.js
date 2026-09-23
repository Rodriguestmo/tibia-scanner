// Guia "Como usar": paginas navegaveis (#help/N), no idioma atual, com exemplos que abrem os dados de demonstracao.
(function () {
  "use strict";

  function Guide(root) {
    this.root = root;
    this.page = 0;
  }

  Guide.prototype.pages = function () {
    return window.GUIDE_CONTENT[window.I18N.locale()] || window.GUIDE_CONTENT.en;
  };

  Guide.prototype.open = function (n) {
    var total = this.pages().length;
    this.page = Math.max(0, Math.min(total - 1, isNaN(n) ? 0 : n));
    this.render();
  };

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function block(b) {
    if (b.p) return el("p", "guide-p", b.p);
    if (b.h) return el("h3", "guide-h", b.h);
    if (b.ul || b.steps) {
      var list = el(b.steps ? "ol" : "ul", b.steps ? "guide-steps" : "guide-list");
      (b.ul || b.steps).forEach(function (item) { list.appendChild(el("li", null, item)); });
      return list;
    }
    if (b.tip || b.warn) {
      var box = el("div", b.tip ? "guide-tip" : "guide-warn");
      box.appendChild(window.ICONS.node(b.tip ? "metadata" : "exclusion"));
      box.appendChild(el("span", null, b.tip || b.warn));
      return box;
    }
    if (b.ev) {
      var grid = el("div", "guide-ev");
      b.ev.forEach(function (row) {
        var item = el("div", "guide-ev-item");
        var icon = window.ICONS.node(row[0]);
        icon.classList.add("guide-ev-icon");
        item.appendChild(icon);
        var body = el("div");
        body.appendChild(el("strong", null, row[1]));
        body.appendChild(el("p", "muted", row[2]));
        item.appendChild(body);
        grid.appendChild(item);
      });
      return grid;
    }
    if (b.ex) {
      var card = el("div", "guide-ex");
      card.appendChild(el("strong", "guide-ex-title", b.ex.title));
      card.appendChild(el("p", null, b.ex.text));
      if (b.ex.link) {
        var a = el("a", "btn", "");
        a.href = b.ex.link;
        a.appendChild(window.ICONS.node("arrow"));
        a.appendChild(el("span", null, t("guide.open_example")));
        card.appendChild(a);
      }
      return card;
    }
    return document.createTextNode("");
  }

  Guide.prototype.render = function () {
    var pages = this.pages(), page = pages[this.page], self = this;
    var root = this.root;
    root.innerHTML = "";
    var layout = el("div", "guide");

    var toc = el("nav", "guide-toc card");
    toc.appendChild(el("h3", "card-title", t("guide.contents")));
    pages.forEach(function (p, i) {
      var a = el("a", "guide-toc-item" + (i === self.page ? " active" : ""));
      a.href = "#help/" + (i + 1);
      a.appendChild(el("span", "guide-toc-n", String(i + 1).padStart(2, "0")));
      a.appendChild(el("span", null, p.title));
      toc.appendChild(a);
    });
    layout.appendChild(toc);

    var article = el("article", "guide-page card");
    var head = el("div", "guide-head");
    var icon = window.ICONS.node(page.icon);
    icon.classList.add("guide-icon");
    head.appendChild(icon);
    var titles = el("div");
    titles.appendChild(el("div", "guide-counter", t("guide.page", { n: this.page + 1, total: pages.length })));
    titles.appendChild(el("h2", "guide-title", page.title));
    head.appendChild(titles);
    article.appendChild(head);
    page.blocks.forEach(function (b) { article.appendChild(block(b)); });

    if (this.page === pages.length - 1) {
      var sign = el("div", "guide-signature");
      sign.appendChild(el("span", "guide-signature-by", "by:"));
      sign.appendChild(el("span", "guide-signature-name", "Cønan"));
      article.appendChild(sign);
    }

    var nav = el("div", "guide-nav");
    var prev = el("a", "btn" + (this.page === 0 ? " disabled" : ""), t("guide.prev"));
    prev.href = "#help/" + Math.max(1, this.page);
    var next = el("a", "btn btn-primary" + (this.page === pages.length - 1 ? " disabled" : ""), t("guide.next"));
    next.href = "#help/" + Math.min(pages.length, this.page + 2);
    nav.appendChild(prev);
    nav.appendChild(el("span", "muted small", t("guide.page", { n: this.page + 1, total: pages.length })));
    nav.appendChild(next);
    article.appendChild(nav);
    layout.appendChild(article);
    root.appendChild(layout);
    root.scrollTop = 0;
    var main = document.querySelector(".main");
    if (main) main.scrollTop = 0;
  };

  window.VIEWS = window.VIEWS || {};
  window.VIEWS.Guide = Guide;
})();
