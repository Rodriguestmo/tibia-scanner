# Tibia Scanner - frontend

SPA estática em JS puro (sem framework nem build). Consome a API do backend no Raspberry Pi.

- `login.html` -> JWT em `localStorage`; `index.html` -> grafo, investigação, comparador, clusters, detetive,
  timeline e últimas 24h.
- Idioma (PT/EN/SV, bandeiras SVG) e fuso (UTC / São Paulo / Estocolmo) são independentes e trocam sem recarregar.
- Tema claro/escuro (segue o sistema na primeira visita), ícones flat SVG, layout responsivo (menu lateral vira
  gaveta no celular).
- Bibliotecas por CDN: vis-network (grafo) e jsPDF (relatório PDF). Fonte IBM Plex Mono.

## Publicar no GitHub Pages

1. Crie um repositório (ex.: `tibia-scanner`) com o conteúdo desta pasta na raiz.
2. Settings > Pages > Source: **GitHub Actions**.
3. Settings > Secrets and variables > Actions > Variables: `BACKEND_URL` = URL do Funnel
   (ex.: `https://<host>.<tailnet>.ts.net:8443`).
4. Push na `main`. O workflow `.github/workflows/deploy.yml` roda `node tests/check.js`, injeta a URL em
   `js/config.js` e publica em `https://<usuario>.github.io/tibia-scanner/`.

Domínio próprio (ex.: `astraweb.app/scan`): configure em Settings > Pages e adicione a origem em
`SCANNER_ALLOWED_ORIGINS` no `.env` do backend.

## Rodar local

```bash
python3 -m http.server 5173     # http://127.0.0.1:5173/login.html
node tests/check.js             # chaves i18n iguais nos 3 idiomas, formatos de data, sem emoji
```

No login, abra "Servidor (backend)" para apontar para outro backend (fica salvo no navegador).
