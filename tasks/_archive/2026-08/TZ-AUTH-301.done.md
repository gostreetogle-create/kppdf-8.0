# TZ-AUTH-301: Мягкий notice «личный учебный проект» на /login

PAGES: /login
PAGE_DOCS: login.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer
ЗАВИСИМОСТИ: Нет (опционально; **не** считать compliance)
LAYER: 3
PRIORITY: low — косметика для приглашённых; **не** замена VPN / firewall / Basic Auth
CONFLICT KEYS: frontend/src/app/pages/login/login.page.ts ; frontend/src/app/pages/login/login.page.spec.ts ; frontend/src/index.html ; docs/pages/login.page.md ; docs/pages/PAGE-TZ-INDEX.md

## ИСХОДНОЕ СОСТОЯНИЕ

1. Контент ERP уже за логином; «открытая дверь» — в основном страница `/login` и сам факт, что порт/домен торчит в интернет.
2. PO хотел короткий текст «личный учебный/тестовый проект» без «организация / корпоратив / сотрудники».
3. Дисклеймер **не** выводит ресурс из-под регулирования и **не** делает его непубличным.
4. Реальная закрытость = VPN / IP allowlist / HTTP Basic Auth / Cloudflare Access (см. `docs/ops/home-host-access.md`).

## ЧТО ДЕЛАТЬ

1. На `LoginPage` под intro (перед формой) — короткий notice:
   - **Заголовок:** `Личный проект для обучения и тестирования`
   - **Текст:** `KPPDF — индивидуальный проект для обучения, экспериментов и проверки идей. Это не публичный сервис и не коммерческий сайт. Вход — для автора и приглашённых участников.`
   - `data-test="personal-project-notice"`.
2. В `index.html` добавлены description `KPPDF — личный проект для обучения и тестирования.` и robots `noindex, nofollow`.
3. Обновлены `docs/pages/login.page.md` и `docs/pages/PAGE-TZ-INDEX.md`.
4. Добавлен Jest-тест notice.

## КРИТЕРИИ ПРИЁМКИ

- [x] Notice с канон-текстом; запрещённые фразы отсутствуют.
- [x] robots noindex,nofollow + мягкий description.
- [x] page.md явно помечает notice как косметику, не access control.
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0).
- [x] `cd frontend && pnpm test -- login.page --runInBand` — PASS (1 suite, 4 tests).
- [x] Archive created with marker.

## known_limitation

Текст и robots **не** делают ресурс юридически «непубличным» и не заменяют сетевые ограничения. См. `docs/ops/home-host-access.md`.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: Buffy / agent-d2515d7a53
protected_files:
  - frontend/src/app/pages/login/login.page.ts
  - frontend/src/app/pages/login/login.page.spec.ts
  - frontend/src/index.html
  - docs/pages/login.page.md
  - docs/pages/PAGE-TZ-INDEX.md
verification:
  - acceptance criteria: PASS
  - frontend typecheck: PASS
  - login.page Jest: PASS (4/4)
  - git diff --check: PASS
  - checklist: UPDATED
  - status synchronization: pre-existing OrchestratorKit verify-status mismatch (72 historical FWD entries), unrelated to AUTH-301
notes: Notice is presentation copy only; Basic Auth/VPN/ops were not changed.
