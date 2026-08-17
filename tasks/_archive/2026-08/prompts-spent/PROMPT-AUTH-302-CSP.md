# Промпт — TZ-AUTH-302 (P0: вход / CSP)

Скопируй Buffy **целиком**. VPN OFF для деплоя. Не жди «поехали».

```text
Ты — исполнитель kppdf-8.0 · D:\kppdf-8.0 · main.
Skills: kppdf-executor-continuous + GEMINI.md
P0: TZ-AUTH-302 — CSP блокирует inline script → вход мигает.

1) git fetch && git checkout main && git pull --ff-only
2) Прочитай tasks/_backlog/ops/TZ-AUTH-302-csp-inline-desktop-url.md
   + docs/agent-checklists/TZ-AUTH-302.md + docs/ops/DANGEROUS-OPS.md
3) CLAIM → убери inline <script> из frontend/src/index.html
   → desktop URL через <meta name="kppdf-desktop-download-url"> (или data-*)
   → обнови desktop-download-url.ts + spec; поправь deploy.py inject если есть
   → НЕ добавляй unsafe-inline в helmet scriptSrc
4) Gates FE/BE → warm deploy.ps1 (WIPE=false). Если preflight орёт на OPS-310:
   спроси PO по-русски ИЛИ сначала быстро OPS-310, если VPN уже off.
5) Smoke: Basic Auth → login admin → нет CSP inline error → вход OK
6) archive + lock + commit+push → Checkpoint

BAN: wipe; снимать Basic Auth; SALES-348 чужие ключи без нужды.
Пароли не печатать. Admin: CREDENTIALS.md § Приложение. Basic: § HTTP Basic Auth.
```
