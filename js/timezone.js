// Fuso de exibicao, independente do idioma. O backend manda tudo em UTC; so aqui vira hora local.
(function () {
  "use strict";
  var ZONES = [
    { id: "UTC", key: "timezone.utc", flag: null },
    { id: "America/Sao_Paulo", key: "timezone.brazil", flag: "pt-BR" },
    { id: "Europe/Stockholm", key: "timezone.sweden", flag: "sv" }
  ];
  var listeners = [];

  function load() {
    var saved = null;
    try { saved = localStorage.getItem("timezone"); } catch (e) { /* ignore */ }
    var ids = ZONES.map(function (z) { return z.id; });
    return ids.indexOf(saved) >= 0 ? saved : (window.SCANNER_CONFIG || {}).DEFAULT_TIMEZONE || "America/Sao_Paulo";
  }

  var current = load();

  function parts(date, locale, tz, hour12) {
    var out = {};
    new Intl.DateTimeFormat(locale, {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: !!hour12
    }).formatToParts(date).forEach(function (p) { out[p.type] = p.value; });
    return out;
  }

  // Formatos pedidos: PT-BR "22/03/2026 20:14", EN "22/03/2026 11:14 PM", SV "2026-03-23 00:14".
  function formatDateTime(value, options) {
    if (value === null || value === undefined || value === "") return "—";
    options = options || {};
    var date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return String(value);
    var locale = options.locale || window.I18N.locale();
    var tz = options.timeZone || current;
    var english = locale === "en";
    var p = parts(date, locale === "sv" ? "sv-SE" : "en-GB", tz, english);
    var hour = p.hour === "24" ? "00" : p.hour;
    var time = hour + ":" + p.minute + (options.seconds ? ":" + p.second : "");
    if (english) time += " " + String(p.dayPeriod || "").toUpperCase();
    if (options.timeOnly) return time;
    var day = locale === "sv" ? p.year + "-" + p.month + "-" + p.day : p.day + "/" + p.month + "/" + p.year;
    return options.dateOnly ? day : day + " " + time;
  }

  // Minutos a somar ao UTC para obter a hora local do fuso (ex.: Sao Paulo -180).
  function offsetMinutes(tz, date) {
    date = date || new Date();
    var p = parts(date, "en-GB", tz || current, false);
    var asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +(p.hour === "24" ? 0 : p.hour), +p.minute, +p.second);
    return Math.round((asUtc - date.getTime()) / 60000);
  }

  function offsetLabel(tz) {
    var m = offsetMinutes(tz);
    if (m === 0) return "";
    var sign = m > 0 ? "+" : "−";
    var h = Math.floor(Math.abs(m) / 60), mm = Math.abs(m) % 60;
    return "UTC" + sign + h + (mm ? ":" + String(mm).padStart(2, "0") : "");
  }

  function setTimezone(tz) {
    if (!ZONES.some(function (z) { return z.id === tz; }) || tz === current) return;
    current = tz;
    try { localStorage.setItem("timezone", tz); } catch (e) { /* ignore */ }
    listeners.forEach(function (fn) { fn(tz); });
  }

  // Re-renderiza todo elemento com data-utc (timestamps) sem recarregar a pagina.
  function refresh(root) {
    (root || document).querySelectorAll("[data-utc]").forEach(function (el) {
      el.textContent = formatDateTime(el.dataset.utc, { seconds: el.dataset.seconds === "1",
        dateOnly: el.dataset.dateOnly === "1" });
      el.title = el.dataset.utc;
    });
  }

  function stamp(utc, opts) {
    var span = document.createElement("time");
    span.dataset.utc = utc || "";
    if (opts && opts.seconds) span.dataset.seconds = "1";
    if (opts && opts.dateOnly) span.dataset.dateOnly = "1";
    span.textContent = formatDateTime(utc, opts);
    span.title = utc || "";
    return span;
  }

  window.TZ = {
    zones: ZONES,
    current: function () { return current; },
    formatDateTime: formatDateTime,
    offsetMinutes: offsetMinutes,
    offsetLabel: offsetLabel,
    setTimezone: setTimezone,
    refresh: refresh,
    stamp: stamp,
    onChange: function (fn) { listeners.push(fn); }
  };
  window.formatDateTime = formatDateTime;
})();
