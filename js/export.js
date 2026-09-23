// Exporta relatorio PNG (canvas do grafo) e PDF (jsPDF: resumo + grafo) no idioma e fuso atuais.
(function () {
  "use strict";

  function download(dataUrl, filename) {
    var a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function slug(name) { return String(name || "grafo").replace(/[^\w-]+/g, "_"); }

  function png(graph, name) {
    var url = graph && graph.png();
    if (url) download(url, "tibia-scanner-" + slug(name) + ".png");
  }

  // Remove emoji/simbolos fora do WinAnsi: a fonte padrao do jsPDF nao os desenha.
  function pdfSafe(text) {
    return String(text || "").replace(/[\u{1F000}-\u{1FFFF}←-⇿⌀-⏿☀-➿]/gu, "").trim();
  }

  function pdf(name, graph) {
    return window.API.report(name).then(function (r) {
      var doc = new window.jspdf.jsPDF({ unit: "pt", format: "a4" });
      var W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), y = 48;
      function line(text, size, bold) {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size || 10);
        doc.splitTextToSize(pdfSafe(text), W - 80).forEach(function (l) {
          if (y > H - 48) { doc.addPage(); y = 48; }
          doc.text(l, 40, y);
          y += (size || 10) * 1.35;
        });
      }
      line(t("export.report_title", { char: r.profile.name }), 18, true);
      line(t("export.generated", { date: window.TZ.formatDateTime(r.generated_utc) }) + " · " +
        (window.TZ.offsetLabel() || "UTC"), 9);
      y += 6;
      line(t("panel.profile"), 12, true);
      [["panel.level", r.profile.level], ["panel.vocation", r.profile.vocation], ["panel.guild", r.profile.guild_name],
        ["panel.residence", r.profile.residence], ["panel.last_login", window.TZ.formatDateTime(r.profile.last_login_utc)]]
        .forEach(function (kv) { line(t(kv[0]) + ": " + (kv[1] === null || kv[1] === undefined ? "-" : kv[1])); });
      y += 6;
      line(t("investigation.suspects", { count: r.suspects.length }), 12, true);
      r.suspects.slice(0, 15).forEach(function (s) {
        line(s.other + " - " + window.GRAPH.pct(s.confidence || s.social), 10, true);
        line(s.detective.conclusion, 9);
        y += 4;
      });
      var img = graph && graph.png();
      if (img) {
        doc.addPage();
        y = 48;
        line(t("nav.graph"), 12, true);
        var props = doc.getImageProperties(img);
        var w = W - 80, h = Math.min(H - 120, w * props.height / props.width);
        doc.addImage(img, "PNG", 40, y, w, h);
      }
      doc.save("tibia-scanner-" + slug(name) + ".pdf");
    });
  }

  window.EXPORT = { png: png, pdf: pdf };
})();
