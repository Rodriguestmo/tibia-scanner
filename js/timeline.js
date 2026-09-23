// Timeline de sessoes (faixas por dia, no fuso escolhido) e timeline animada da teia de clusters.
(function () {
  "use strict";

  function dayKey(ms) {
    return window.TZ.formatDateTime(new Date(ms), { dateOnly: true });
  }

  // Uma linha por dia; cada sessao vira uma barra posicionada pela hora local de inicio/fim.
  function renderSessions(container, sessions) {
    container.innerHTML = "";
    container.classList.add("sessions");
    if (!sessions || !sessions.length) {
      container.innerHTML = '<p class="muted" data-i18n="panel.none">' + t("panel.none") + "</p>";
      return;
    }
    var offset = window.TZ.offsetMinutes() * 60000;
    var rows = {};
    sessions.forEach(function (s) {
      var start = Date.parse(s.login_utc), end = Date.parse(s.logout_utc || s.last_seen_utc);
      var cursor = start;
      while (cursor < end) {
        var localMidnight = Math.floor((cursor + offset) / 86400000) * 86400000 - offset;
        var sliceEnd = Math.min(end, localMidnight + 86400000);
        var key = dayKey(cursor);
        (rows[key] = rows[key] || { order: localMidnight, bars: [] }).bars.push({
          from: (cursor - localMidnight) / 864e5, to: (sliceEnd - localMidnight) / 864e5,
          login: s.login_utc, logout: s.logout_utc
        });
        cursor = sliceEnd;
      }
    });
    Object.keys(rows).sort(function (a, b) { return rows[a].order - rows[b].order; }).forEach(function (key) {
      var row = document.createElement("div");
      row.className = "session-row";
      var label = document.createElement("span");
      label.className = "session-day";
      label.textContent = key;
      var track = document.createElement("div");
      track.className = "session-track";
      rows[key].bars.forEach(function (b) {
        var bar = document.createElement("span");
        bar.className = "session-bar";
        bar.style.left = (b.from * 100).toFixed(2) + "%";
        bar.style.width = Math.max(0.3, (b.to - b.from) * 100).toFixed(2) + "%";
        bar.title = window.TZ.formatDateTime(b.login) + " → " + window.TZ.formatDateTime(b.logout);
        track.appendChild(bar);
      });
      row.appendChild(label);
      row.appendChild(track);
      container.appendChild(row);
    });
  }

  // Slider dia a dia sobre o grafo: mostra so as arestas cujo primeiro vinculo e anterior ao dia escolhido.
  function Animated(slider, label, playBtn, onDay) {
    this.slider = slider;
    this.label = label;
    this.playBtn = playBtn;
    this.onDay = onDay;
    this.days = [];
    this.timer = null;
    var self = this;
    slider.addEventListener("input", function () { self.show(+slider.value); });
    playBtn.addEventListener("click", function () { self.toggle(); });
  }

  Animated.prototype.setRange = function (edges) {
    var firsts = edges.map(function (e) { return Date.parse(e.first_utc || ""); }).filter(function (x) { return !isNaN(x); });
    var start = firsts.length ? Math.min.apply(null, firsts) : Date.now();
    var today = Date.now();
    this.days = [];
    for (var d = start; d <= today + 864e5; d += 864e5) this.days.push(d);
    this.slider.min = 0;
    this.slider.max = Math.max(0, this.days.length - 1);
    this.slider.value = this.slider.max;
    this.show(+this.slider.value);
  };

  Animated.prototype.show = function (i) {
    var day = this.days[i] || Date.now();
    this.label.textContent = t("timeline.day", { n: i + 1 }) + " · " +
      t("timeline.date", { date: window.TZ.formatDateTime(new Date(day), { dateOnly: true }) });
    this.onDay(day + 864e5);
  };

  Animated.prototype.toggle = function () {
    var self = this;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.playBtn.dataset.i18n = "timeline.play";
      this.playBtn.textContent = t("timeline.play");
      return;
    }
    if (+this.slider.value >= +this.slider.max) this.slider.value = 0;
    this.playBtn.dataset.i18n = "timeline.pause";
    this.playBtn.textContent = t("timeline.pause");
    this.timer = setInterval(function () {
      var next = +self.slider.value + 1;
      if (next > +self.slider.max) return self.toggle();
      self.slider.value = next;
      self.show(next);
    }, 700);
  };

  Animated.prototype.relabel = function () { this.show(+this.slider.value); };

  window.TIMELINE = { renderSessions: renderSessions, Animated: Animated };
})();
