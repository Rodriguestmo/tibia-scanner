// Tema claro/escuro. Carregado no <head> para nao piscar; padrao segue o sistema, escolha fica no localStorage.
(function () {
  "use strict";
  var root = document.documentElement;

  function preferred() {
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) { /* ignore */ }
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function paintButton(theme) {
    var btn = document.getElementById("theme-toggle");
    if (!btn || !window.ICONS) return;
    btn.innerHTML = window.ICONS.svg(theme === "dark" ? "sun" : "moon");
  }

  function set(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch (e) { /* ignore */ }
    paintButton(theme);
  }

  root.dataset.theme = preferred();
  document.addEventListener("DOMContentLoaded", function () { paintButton(root.dataset.theme); });

  window.THEME = {
    current: function () { return root.dataset.theme; },
    set: set,
    toggle: function () { set(root.dataset.theme === "dark" ? "light" : "dark"); }
  };
})();
