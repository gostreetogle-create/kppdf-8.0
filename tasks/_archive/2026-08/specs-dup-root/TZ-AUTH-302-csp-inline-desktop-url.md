═══════════════════════════════════════════════════════════════
TZ-AUTH-302: Убрать inline-script (CSP) — починить вход на проде
═══════════════════════════════════════════════════════════════

PAGES: /login
PAGE_DOCS: login.page.md

РОЛЬ АГЕНТА: Frontend + Backend (CSP) + warm deploy
ЗАВИСИМОСТИ: нет (P0 прод: вход мигает / CSP в консоли)
LAYER: 2
PRIORITY: P0
CONFLICT KEYS: frontend/src/index.html ; frontend/src/app/core/desktop-download-url.ts ; frontend/src/app/core/desktop-download-url.spec.ts ; backend/src/main.ts ; docs/pages/login.page.md ; docs/pages/PAGE-TZ-INDEX.md ; deploy/synology/deploy.py (только если там подмена скрипта DESKTOP_DOWNLOAD_URL)

Проверено: prod CSP `script-src 'self'`; в HTML есть
`<script>window.__DESKTOP_DOWNLOAD_URL__ = undefined;</script>` → консоль
«Executing inline script violates CSP»; Angular modules грузятся; API
`POST /api/auth/login` с Basic+username/password → 200.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. После HTTP Basic Auth («подъезд») страница логина открывается, но вход
   в приложение мигает / не пускает; в DevTools — CSP на inline script.
2. Источник inline: `frontend/src/index.html` (inject для Desktop ZIP URL).
3. Helmet в `backend/src/main.ts`: `scriptSrc: ["'self'"]` — правильно не
   ослаблять до `'unsafe-inline'` для script-src.
4. `inlineCritical: false` в angular.json уже есть.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Убрать inline `<script>` из `index.html`.
2. Передать desktop URL без JS-исполнения, например:
   - `<meta name="kppdf-desktop-download-url" content="">`  
     (пустой = default; deploy может подставить URL в content), **или**
   - `data-desktop-download-url` на `<app-root>`.
3. Обновить `desktop-download-url.ts` (+ spec): читать meta/data вместо
   `window.__DESKTOP_DOWNLOAD_URL__`. Сохранить семантику:
   absent → default `/downloads/kppdf-desktop-setup.zip`;
   explicit empty → disable.
4. Если `deploy.py` патчит index под `DESKTOP_DOWNLOAD_URL` — переключить
   патч на meta/content (не генерировать inline script).
5. **Не** добавлять `'unsafe-inline'` в `scriptSrc` helmet.
6. Gates: FE tsc + jest desktop-download-url / login.page; BE tsc.
7. Warm deploy (`deploy.ps1`, WIPE=false). Если нет archive OPS-310 —
   сначала OPS-310 **или** явный PO «деплой срочно, OPS-310 потом» /
   опасный ops по-русски.
8. Smoke: `https://kppdf-crm.ru` → Basic → `/login` → admin login →
   консоль **без** CSP script violation; вход успешен.
9. Archive TZ-AUTH-302 + lock + push + checkpoint.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Снимать Basic Auth / открывать сайт без подъезда
- WIPE
- WAVE-KP-COMPLETE / SALES-348 (чужие keys), кроме конфликта deploy-очереди
- Ослабление CSP `script-src` до unsafe-inline

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] В собранном `index.html` нет inline `<script>` без src
- [ ] Prod/login: нет CSP error про inline script
- [ ] Вход admin работает после Basic Auth
- [ ] Desktop download URL resolve: default / empty / set — тесты зелёные
- [ ] Warm deploy без wipe; archive + push

PARALLEL-SAFE: нет vs другой FE на index.html; да vs SALES-348 если не трогает index/main.ts.
Workspace: D:\kppdf-8.0. VPN OFF для деплоя.
