// Checagens sem navegador (node tests/check.js): paridade das chaves nos 3 idiomas, toda chave usada existe,
// formatos de data/fuso do enunciado e nenhum emoji na interface.
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

global.localStorage = { getItem: () => null, setItem: () => {} };
Object.defineProperty(global, "navigator", { value: { language: "pt-BR" }, configurable: true });
global.window = global;
global.document = { documentElement: {} };
require(path.join(root, "js/config.js"));
require(path.join(root, "js/i18n.js"));
require(path.join(root, "js/timezone.js"));

let failures = 0;
const fail = (msg) => { failures += 1; console.error("FALHA:", msg); };

const tr = I18N.translations;
const keys = (l) => Object.keys(tr[l]).sort();
for (const l of ["en", "sv"]) {
  const missing = keys("pt-BR").filter((k) => !(k in tr[l]));
  const extra = keys(l).filter((k) => !(k in tr["pt-BR"]));
  if (missing.length || extra.length) fail(`${l}: faltando ${missing} / sobrando ${extra}`);
}

const sources = ["index.html", "login.html", ...fs.readdirSync(path.join(root, "js")).map((f) => "js/" + f)];
const used = new Set();
for (const file of sources) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const m of text.matchAll(/data-i18n(?:-placeholder|-title|-aria)?="([\w.]+)"/g)) used.add(m[1]);
  for (const m of text.matchAll(/\bt\("([\w.]+)"/g)) used.add(m[1]);
  for (const m of text.matchAll(/i18nEl\([^,]+,\s*[^,]+,\s*"([\w.]+)"/g)) used.add(m[1]);
  for (const m of text.matchAll(/section\("([\w.]+)"/g)) used.add(m[1]);
  if (!file.endsWith("export.js") && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text)) fail(`emoji em ${file}`);
}
for (const k of used) if (!k.endsWith(".") && !(k in tr["pt-BR"])) fail(`chave usada e inexistente: ${k}`);  // "x." = prefixo dinamico

const at = "2026-03-22T23:14:00Z";
const cases = [
  ["pt-BR", "America/Sao_Paulo", "22/03/2026 20:14"], ["pt-BR", "UTC", "22/03/2026 23:14"],
  ["pt-BR", "Europe/Stockholm", "23/03/2026 00:14"], ["en", "UTC", "22/03/2026 11:14 PM"],
  ["en", "Europe/Stockholm", "23/03/2026 12:14 AM"], ["sv", "Europe/Stockholm", "2026-03-23 00:14"],
];
for (const [locale, timeZone, want] of cases) {
  const got = TZ.formatDateTime(at, { locale, timeZone });
  if (got !== want) fail(`${locale}/${timeZone}: ${got} != ${want}`);
}

console.log(failures ? `${failures} falha(s)` : `ok: ${used.size} chaves usadas, 3 idiomas iguais, 6 formatos de data`);
process.exit(failures ? 1 : 0);
