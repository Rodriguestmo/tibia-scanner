// Icones flat em SVG (traco 1.8, 24x24, mesmo estilo do painel Boiuna). Herdam a cor do texto (currentColor).
(function () {
  "use strict";
  var P = {
    relog: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    exclusion: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    metadata: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    highscore: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    network: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
    house: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    guild: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
    naming: '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>',
    transitive: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    graph: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 8l5 8M18 8l-5 8"/>',
    investigation: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/><path d="M8 11h6M11 8v6"/>',
    compare: '<rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/><path d="M6.5 8h0M17.5 8h0"/>',
    clusters: '<circle cx="8" cy="8" r="4"/><circle cx="16" cy="16" r="4"/><circle cx="17" cy="7" r="2"/>',
    timeline: '<path d="M3 12h18"/><circle cx="7" cy="12" r="2"/><circle cx="14" cy="12" r="2"/><path d="M7 6v4M14 14v4M20 9v6"/>',
    detective: '<path d="M4 10h16"/><path d="M6 10l2-6h8l2 6"/><circle cx="8" cy="16" r="3"/><circle cx="16" cy="16" r="3"/><path d="M11 16h2"/>',
    changes: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    logout: '<path d="M15 4h4v16h-4"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    play: '<path d="M7 5l12 7-12 7V5z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    file: '<path d="M6 3h8l4 4v14H6V3z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    filter: '<path d="M4 5h16l-6 7v6l-4 2v-8L4 5z"/>',
    target: '<circle cx="12" cy="12" r="8"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
    live: '<circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>',
    skull: '<path d="M12 3a8 8 0 0 0-8 8c0 3 1.5 4.5 3 5.5V20h10v-3.5c1.5-1 3-2.5 3-5.5a8 8 0 0 0-8-8z"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/><path d="M10 20v-2M14 20v-2"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    logo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v5M12 16v5M3 12h5M16 12h5"/>'
  };

  function svg(name, cls) {
    return '<svg class="icon' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.metadata) + "</svg>";
  }

  function node(name, cls) {
    var span = document.createElement("span");
    span.className = "icon-wrap";
    span.innerHTML = svg(name, cls);
    return span;
  }

  // Bandeiras flat (sem emoji): Brasil, Reino Unido e Suecia.
  var FLAGS = {
    "pt-BR": '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#229e45"/>' +
      '<path d="M15 2.5L27 10 15 17.5 3 10z" fill="#f8d12e"/><circle cx="15" cy="10" r="4.2" fill="#2b49a3"/>' +
      '<path d="M11 9.3c2.7-.6 5.5-.2 8 1.1" stroke="#fff" stroke-width=".8" fill="none"/></svg>',
    "en": '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#1f3a8a"/>' +
      '<path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.6"/>' +
      '<path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.4"/></svg>',
    "sv": '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#1f5aa6"/>' +
      '<path d="M11 0v20M0 10h30" stroke="#f7c600" stroke-width="4"/></svg>'
  };

  window.ICONS = { svg: svg, node: node, FLAGS: FLAGS, names: Object.keys(P) };
})();
