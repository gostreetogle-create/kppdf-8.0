# TZ-FRONTEND-303: Починить старые падающие frontend Jest (materials + form-profiles)

РОЛЬ АГЕНТА: Frontend test repair engineer (Angular 20 / Jest)

ЗАВИСИМОСТИ: TZ-FRONTEND-302 DONE (integrity wave landed on main)

LAYER: 2

PAGES: /materials ; /materials/:id
PAGE_DOCS: (обновить только если меняется поведение страницы — иначе N/A)

CONFLICT KEYS:

- `frontend/src/app/pages/materials/materials.page.spec.ts` ;
  `frontend/src/app/pages/materials/materials.page-316.spec.ts` ;
  `frontend/src/app/pages/materials/material-detail.page.spec.ts` ;
  `frontend/src/app/pages/materials/materials.page.ts` ;
  `frontend/src/app/pages/materials/material-detail.page.ts` ;
  `frontend/src/app/shared/services/form-profiles.service.spec.ts` ;
  `frontend/src/app/shared/services/form-profiles.service.ts` ;
  `docs/agent-checklists/TZ-FRONTEND-303.md`

Не пересекать с активным `TZ-SALES-375` (products rail / proposal-create). При пересечении exact keys → STOP.

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено (integrity closeout evidence):

- Full frontend Jest после волны: **150/154** suites, **1427/1440** tests.
- Известный baseline debt (**не** из A1–A6 / B-PHOTO): падают suites вокруг
  `materials.page`, `material-detail.page`, `materials.page-316`, `form-profiles.service`
  (~13 тестов).
- Эти падения воспроизводились на чистом canonical baseline до integrity-фиксов.
- Цель волны 302 была не чинить их; сейчас отдельная фоновая задача.

Проверено: Angular 20.3 / Jest / `pnpm --dir frontend test`.

## ЧТО ДЕЛАТЬ

1. Isolated worktree от свежего `origin/main` (не `.freebuff`, не dirty main).
2. CLAIM: `tasks/_active/TZ-FRONTEND-303.md` + checklist Claim slot **до** правок.
   Claim должен быть виден другим worktrees (Team Room или root `_active`).
3. Зафиксировать baseline: прогнать только failing suites, записать exact fail messages.
4. Для каждого fail определить: **сломан тест** / **сломан код** / **нужен выбор PO**.
   - Понятный repair → чинить минимально.
   - Нужен UX/API/business выбор → STOP + вопрос PO, не угадывать.
5. Characterization: не «подкручивать expect под любой код». Сначала зафиксировать
   желаемое текущее поведение из page canon / соседних зелёных specs.
6. Чинить маленькими коммитами (materials отдельно от form-profiles допустимо).
7. Gates после каждого куска и в финале:
   - focused Jest на затронутые specs → PASS;
   - `pnpm --dir frontend typecheck` PASS;
   - ESLint changed files PASS;
   - `pnpm architecture:check` PASS;
   - `git diff --check` PASS;
   - полный `pnpm --dir frontend test` — не добавлять новых fail; целевые 13 зелёные.
8. Archive/lock/progress/checklist; commit/push. Deploy НЕ.

## НЕ ИЗМЕНЯТЬ

- Backend, RBAC, routes, KP/proposal-create, QuickCreate, photo dropzone;
- ESLint severity / architecture baseline expansion / новые зависимости;
- Массовый рефакторинг materials UI «заодно»;
- Deploy / SSH / wipe.

## КРИТЕРИИ ПРИЁМКИ

1. Suites `materials.page`, `materials.page-316`, `material-detail.page`,
   `form-profiles.service` — PASS (или явный BLOCKED с successor, если нужен PO-выбор).
2. Нет новых failing suites относительно baseline main.
3. Product behavior без сознательного UX/API change; если чинится баг — одна строка
   в checklist «что изменилось для пользователя».
4. Checklist + archive + lock + push SHA.
5. Deploy НЕ.

## ФИНАЛИЗАЦИЯ

Root TZ: checklist → archive `tasks/_archive/2026-08/TZ-FRONTEND-303.done.md` →
lock → progress → удалить `_active` → commit/push.
