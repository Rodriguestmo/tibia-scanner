// Grafo interativo de "garfos" (vis-network): no = personagem, aresta = associacao com % e icones da evidencia.
(function () {
  "use strict";
  var COLORS = { high: "#4fb286", mid: "#d9b45b", low: "#89928b", social: "#5b9bd5", excluded: "#d05b61" };

  function css(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v || "").trim() || fallback;
  }

  function edgeColor(e) {
    if (e.excluded) return e.social ? COLORS.social : COLORS.excluded;
    if (!e.confidence && e.social) return COLORS.social;
    if (e.confidence >= 0.8) return COLORS.high;
    if (e.confidence >= 0.5) return COLORS.mid;
    return COLORS.low;
  }

  // Rotulo so com o numero: canvas nao desenha SVG; os tipos de evidencia aparecem no tooltip com icones.
  function edgeLabel(e) {
    if (e.excluded) return e.social ? pct(e.social) : "0%";
    return pct(e.confidence || e.social || 0);
  }

  // Nunca mostra 100%: o motor limita a confianca (max_confidence) e "100%" sugeriria certeza absoluta.
  function pct(value) {
    return Math.min(99, Math.round((value || 0) * 100)) + "%";
  }

  function edgeTitle(e) {
    var head = e.excluded ? t("graph.evidence.exclusion") + (e.social ? " · " + t("graph.social") + ": " + pct(e.social) : "") :
      t("graph.confidence") + ": " + pct(e.confidence) + (e.social ? " · " + t("graph.social") + ": " + pct(e.social) : "");
    var el = document.createElement("div");
    el.className = "vis-tip";
    var title = document.createElement("strong");
    title.textContent = e.a + " / " + e.b;
    el.appendChild(title);
    var sub = document.createElement("div");
    sub.textContent = head;
    el.appendChild(sub);
    (e.kinds || []).forEach(function (k) {
      var row = document.createElement("div");
      row.className = "vis-tip-row";
      row.appendChild(window.ICONS.node(k));
      row.appendChild(document.createTextNode(t("graph.evidence." + k)));
      el.appendChild(row);
    });
    return el;
  }

  // Limites de zoom: com poucos nos o "fit" do vis-network ampliava tudo (no celular os nos ficavam gigantes).
  function small() { return window.matchMedia("(max-width: 860px)").matches; }
  function maxScale() { return small() ? 0.9 : 1.4; }
  var MIN_SCALE = 0.15;

  var PALETTE = ["#d9b45b", "#4fb286", "#5b9bd5", "#c77dba", "#d98a4e", "#4fb3b3", "#9bb85c", "#d05b61"];

  function Graph(container, onSelect) {
    this.container = container;
    this.onSelect = onSelect;
    this.nodes = new vis.DataSet();
    this.edges = new vis.DataSet();
    this.data = { nodes: [], edges: [], clusters: [] };
    this.network = new vis.Network(container, { nodes: this.nodes, edges: this.edges }, {
      autoResize: true,
      interaction: { hover: !small(), tooltipDelay: 120, navigationButtons: false, keyboard: true, zoomSpeed: 0.5 },
      physics: { solver: "forceAtlas2Based", stabilization: { iterations: 180 },
        forceAtlas2Based: { gravitationalConstant: -60, springLength: 120 } },
      nodes: { shape: "dot", size: 14, borderWidth: 2 },
      edges: { smooth: { type: "continuous" }, selectionWidth: 2 }
    });
    this.applyTheme();
    var self = this;
    this.network.on("click", function (p) {
      if (p.nodes.length && self.onSelect) self.onSelect(p.nodes[0]);
    });
    // Pinca/roda do mouse nunca passa dos limites.
    this.network.on("zoom", function () {
      var s = self.network.getScale();
      if (s > maxScale() || s < MIN_SCALE) {
        self.network.moveTo({ scale: Math.min(maxScale(), Math.max(MIN_SCALE, s)) });
      }
    });
    this.network.on("stabilizationIterationsDone", function () { self.fit(); });
    var timer = null;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { self.fit(); }, 200);
    });
  }

  // Enquadra todos os nos, sem ampliar alem do limite.
  Graph.prototype.fit = function () {
    this.network.fit({ animation: false });
    if (this.network.getScale() > maxScale()) this.network.moveTo({ scale: maxScale() });
  };

  // Cores do texto seguem o tema (claro/escuro) via variaveis CSS.
  Graph.prototype.applyTheme = function () {
    var font = "IBM Plex Mono, Menlo, monospace";
    this.network.setOptions({
      nodes: { font: { color: css("--text", "#e7e5db"), size: small() ? 11 : 12, face: font }, size: small() ? 10 : 14,
        color: { border: css("--border", "#303a34"), background: css("--surface-2", "#202824") } },
      edges: { font: { color: css("--text-2", "#c3cac2"), size: small() ? 9 : 11, strokeWidth: 3, strokeColor: css("--bg", "#0f1312"),
        face: font } }
    });
    if (this.data && this.data.nodes.length) this.render(this._filter || function () { return true; });
  };

  Graph.prototype.load = function (data) {
    this.data = data;
    this.render(function () { return true; });
  };

  // filterEdge decide quais arestas aparecem (filtros e timeline); nos sem aresta visivel somem.
  Graph.prototype.render = function (filterEdge) {
    this._filter = filterEdge;
    var edges = this.data.edges.filter(filterEdge);
    var keep = {};
    edges.forEach(function (e) { keep[e.a] = true; keep[e.b] = true; });
    var nodes = this.data.nodes.filter(function (n) { return keep[n.id]; });
    this.nodes.clear();
    this.edges.clear();
    this.nodes.add(nodes.map(function (n) {
      var color = n.cluster === null || n.cluster === undefined ? css("--surface-2", "#202824") : PALETTE[n.cluster % PALETTE.length];
      return {
        id: n.id, label: n.id + (n.level ? " (" + n.level + ")" : ""),
        color: { background: color, border: n.target ? COLORS.excluded : css("--border-strong", "#3a4740") },
        borderWidth: n.target ? 4 : 2,
        title: [n.id, n.vocation, n.guild].filter(Boolean).join(" · ")
      };
    }));
    this.edges.add(edges.map(function (e, i) {
      return {
        id: e.a + "|" + e.b + "|" + i, from: e.a, to: e.b, label: edgeLabel(e), title: edgeTitle(e),
        color: { color: edgeColor(e), highlight: edgeColor(e) },
        width: e.excluded ? 1 : 1 + 5 * Math.max(e.confidence || 0, (e.social || 0) * 0.5),
        dashes: !!(e.inferred || (e.excluded && !e.social))
      };
    }));
    this.fit();
    return { nodes: nodes.length, edges: edges.length };
  };

  Graph.prototype.focus = function (names) {
    var ids = names.filter(function (n) { return this.nodes.get(n); }, this);
    if (!ids.length) return;
    this.network.selectNodes(ids);
    this.network.fit({ nodes: ids, animation: false });
    if (this.network.getScale() > maxScale()) this.network.moveTo({ scale: maxScale() });
  };

  Graph.prototype.png = function () {
    var canvas = this.container.querySelector("canvas");
    return canvas ? canvas.toDataURL("image/png") : null;
  };

  window.GRAPH = { Graph: Graph, COLORS: COLORS, edgeColor: edgeColor, pct: pct };
})();
