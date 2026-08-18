═══════════════════════════════════════════════════════════════
TZ-COMP-401: путь A — политика ПДн + enroll notice + nginx /legal
═══════════════════════════════════════════════════════════════

PAGES: /legal/privacy ; /enroll/:token ; /login
PAGE_DOCS: legal-privacy.page.md ; enroll.page.md ; login.page.md

> PO 2026-08-18: **путь A**. VPN нет. Вход — только разрешённые компьютеры (device-invite как сейчас).
> Не юридическая консультация. Текст политики = черновик `docs/legal/privacy-policy.ru.md` + формула «внутренняя ИС».

РОЛЬ АГЕНТА: Frontend + ops nginx snippet (VPS kppdf-proxy). Root TZ, GEMINI.md.

ЗАВИСИМОСТИ: Нет. Path A выбран PO.

LAYER: 3 (enroll.page.ts + login.page.ts + routes + nginx)

CONFLICT KEYS: frontend/src/app/app.routes.ts; frontend/src/app/pages/enroll/enroll.page.ts; frontend/src/app/pages/login/login.page.ts; frontend/src/app/pages/legal/privacy.page.ts; frontend/src/app/pages/legal/privacy.page.spec.ts; docs/pages/legal-privacy.page.md; docs/pages/enroll.page.md; docs/pages/PAGE-TZ-INDEX.md; docs/legal/privacy-policy.ru.md; docs/ops/home-host-access.md

Проверено: `app.routes.ts` enroll без authGuard L66–68; login publicOnlyGuard L58–61; nginx AUTH-305 `location /enroll/` public, `location /` auth_request; prod 2026-08-18 GET `/legal/privacy` = 401; GET `/enroll/probe` = 200 без ссылки на политику; register 410.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. UI `/` и `/login` за device cookie → 401 с улицы. `/enroll/:token` публичен.
2. Политики нет. Форма enroll — одно поле имени компьютера, без текста «зачем».
3. Device-grant, роли, заказы, отгрузка — не эта TZ.
4. `robots.txt` на проде: `Allow: /` (противоречит meta noindex).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Страница `/legal/privacy`

- Новый standalone `privacy.page.ts`. Route **рядом с enroll**, без `authGuard` / без `publicOnlyGuard`.
- Текст из `docs/legal/privacy-policy.ru.md`. В блоке «кто мы»: **«Внутренняя информационная система. Доступ только уполномоченным лицам по приглашению администратора. Не публичный сервис и не рекламная площадка.»** Плейсхолдеры ИНН/адреса не выдумывать — оставить «уточняется у оператора» если в файле ещё `[ ]`.
- Title: «KPPDF — Политика обработки персональных данных».
- Без cookie-баннера, без галочки «принимаю всё», без analytics.

ШАГ 2: Enroll + login — ссылка и одна фраза

- `/enroll`: под кнопкой «Подключить», до футера версии:  
  «Чтобы подключить этот компьютер, сохраняем его имя и технический cookie доступа. Не для рекламы.»  
  Ссылка: «Политика обработки персональных данных» → `/legal/privacy`.
- `/login`: та же ссылка внизу карточки (на случай owner break-glass). Дисклеймер «учебный проект» **заменить** на ту же формулу внутренней ИС (одна фраза, не простыня).
- Поле enroll, POST, cookie, токен — **не менять**.

ШАГ 3: nginx (VPS, как AUTH-305)

- `location /legal/` **без** `auth_request`, по образцу `/enroll/` (SPA index).
- `nginx -t` + reload. Rollback-копия конфига до правки.
- Не вешать auth_request на `/api/` (Desktop JWT).

ШАГ 4: robots

- Прод `robots.txt`: `User-agent: *` / `Disallow: /` (убрать Allow и sitemap, если 401). Meta noindex уже есть — не ломать.

ШАГ 5: docs

- `docs/pages/legal-privacy.page.md` (кратко). Строка в PAGE-TZ-INDEX.
- enroll.page.md: ссылка + notice. home-host-access.md: `/legal/` в public list.
- Checklist + Executor report (auto) по GEMINI.md.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: файлы из CONFLICT KEYS; nginx kppdf-proxy на VPS (legal + robots); checklist.

НЕ ИЗМЕНЯТЬ:
- device-enrollment backend, cookie TTL, invite TTL
- POST /auth/register (остаётся 410)
- заказы, отгрузка, КП, Гант, Desktop pairing
- Sentry DSN, GA, OAuth
- wipe / деплой приложения без отдельного «кати» PO (nginx reload этой TZ — да, wipe — нет)
- VPN / Tailscale / Cloudflare Access

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Анонимный `GET https://kppdf-crm.ru/legal/privacy` → **200**, виден текст «внутренняя информационная система»
- [ ] `GET /enroll/<любой>` → 200, видна ссылка на `/legal/privacy`, форма по-прежнему одно поле имени
- [ ] `GET /` без cookie → по-прежнему **401** (ERP не открылся)
- [ ] `POST /api/auth/register` → по-прежнему 410
- [ ] `cd frontend && pnpm exec ng test -- --include='**/privacy.page.spec.ts'` PASS
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] `cd frontend && pnpm exec ng build` PASS (focused, не полный matrix)
- [ ] robots.txt: Disallow: /
- [ ] `## Executor report (auto)` в checklist

KNOWN LIMITATION: ИНН оператора и уведомление РКН — PO + юрист, не этот TZ. Закрытие `POST /api/auth/login` с улицы — **TZ-COMP-402** (не смешивать).

Финализация: `tasks/_archive/2026-08/` + GEMINI.md. Deploy приложения — только по «кати» PO; nginx legal/robots можно применить в этой TZ если PO уже сказал «делаем A» (да) — **не wipe**.
