// Heatmap 7x24. O vetor do backend comeca segunda 00h UTC; aqui giramos para o fuso escolhido.
(function () {
  "use strict";

  function toLocal(vector) {
    var shift = Math.round(window.TZ.offsetMinutes() / 60); // horas a somar ao UTC
    var out = new Array(168).fill(0);
    for (var i = 0; i < 168; i++) out[((i + shift) % 168 + 168) % 168] += vector[i] || 0;
    return out;
  }

  function render(container, vector, opts) {
    opts = opts || {};
    container.innerHTML = "";
    container.classList.add("heatmap");
    var data = toLocal(vector || []);
    var max = Math.max.apply(null, data.concat([1]));
    var grid = document.createElement("div");
    grid.className = "heatmap-grid";
    grid.appendChild(document.createElement("span"));
    for (var h = 0; h < 24; h++) {
      var hl = document.createElement("span");
      hl.className = "heatmap-hour";
      hl.textContent = h % 3 === 0 ? String(h).padStart(2, "0") : "";
      grid.appendChild(hl);
    }
    for (var d = 0; d < 7; d++) {
      var label = document.createElement("span");
      label.className = "heatmap-day";
      label.dataset.i18n = "weekday." + d;
      label.textContent = t("weekday." + d);
      grid.appendChild(label);
      for (var hour = 0; hour < 24; hour++) {
        var v = data[d * 24 + hour];
        var cell = document.createElement("span");
        cell.className = "heatmap-cell";
        var alpha = v ? 0.15 + 0.85 * (v / max) : 0;
        cell.style.background = v ? "rgba(" + (opts.rgb || getComputedStyle(document.documentElement).getPropertyValue("--heat").trim() || "217, 180, 91") + "," + alpha.toFixed(3) + ")" : "";
        cell.title = t("weekday." + d) + " " + String(hour).padStart(2, "0") + "h: " + t("common.minutes", { n: Math.round(v / 60) });
        grid.appendChild(cell);
      }
    }
    container.appendChild(grid);
    var tz = document.createElement("div");
    tz.className = "muted small";
    tz.textContent = window.TZ.offsetLabel() || "UTC";
    container.appendChild(tz);
  }

  window.HEATMAP = { render: render, toLocal: toLocal };
})();
