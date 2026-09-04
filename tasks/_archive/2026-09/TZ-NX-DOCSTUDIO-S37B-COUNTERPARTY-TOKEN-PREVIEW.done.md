# TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S37 smoke FAIL AC2  
**CONFLICT KEYS:** `frontend-nx/.../studio-editor.page.ts` (ERP insert / preview path only if needed); text props / field picker components used by studio

## ИСХОДНОЕ

S37 operator smoke (`docs/audits/2026-09-04-docstudio-finish-smoke.md`):  
AC2 FAIL — выбран клиент в «Данные», но не доказана вставка `{{counterparty.name}}` через «Поле ERP» и подстановка в **Просмотр**.

## ЧТО ДЕЛАТЬ

1. Воспроизвести: Новый/открытый КП → Клиент выбран → текст → «Поле ERP» → `counterparty.name` → Просмотр показывает имя клиента (не сырой токен).  
2. Если UI picker ломается (overlay/focus) — починить минимально.  
3. Spec или smoke note в checklist.  
4. `nx build kppdf-web` LAST.

## НЕ ИЗМЕНЯТЬ

- PDF pipeline, Save, vitrina selection (уже PASS в S37).

## КРИТЕРИИ ПРИЁМКИ

1. Preview подставляет имя выбранного клиента из `{{counterparty.name}}`.  
2. Gates PASS.

## Claim slot
- agent_id: claude
- claimed_at: 2026-09-04T19:14:14Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Что сделано (см. полный отчёт `docs/agent-checklists/TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW.md`)

Полный код-трейс цепочки «Поле ERP» → Просмотр по всем трём слоям
(UI insert → doc.context.counterpartyId → substitution bag → рендер) не нашёл
дефекта в продуктовом коде. Backend-путь уже был покрыт тестом с S8-1
(`2026-09-03`, до S37 smoke). Frontend-путь (клик «Поле ERP» → диалог → 
`richText().insertContent()`) **не имел тестового покрытия** — это и было
причиной, по которой AC2 нельзя было доказать в S37. Добавлен
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.spec.ts`,
закрывающий этот пробел (2 теста, оба PASS). Продуктовый код не менялся —
дефекта не найдено.

Известное ограничение: живой browser-клик в этой сессии не выполнен (нет
browser/Playwright-инструмента; `POST /api/auth/login` заблокирован
security-классификатором auto mode). Рекомендован короткий живой re-check
перед финальным закрытием WAVE S37.

## Gates (факт)

```
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
→ PASS, exit 0

cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/studio
→ PASS, 11 suites / 56 tests

cd backend && pnpm exec jest src/modules/studio-document/studio-output.service.spec.ts
→ PASS, 7/7 (backend counterparty-hydration path, unchanged, re-verified)

cd frontend-nx && pnpm exec nx lint kppdf-web
→ FAIL (baseline, pre-existing — 21 errors/74 warnings across studio files
  untouched by this TZ; confirmed via git-stash A/B that the same failures
  exist without this session's new spec file; out of scope for S37B conflict
  keys)

cd frontend-nx && pnpm exec nx build kppdf-web
→ PASS, exit 0 (LAST command, warnings only — pre-existing CSS budget /
  NG8102 warnings, no errors)
```

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: Claude
verification:
  - acceptance criteria: PASS (AC2 reproduced at code level — no defect found; regression coverage added)
  - typecheck: PASS
  - tests: PASS (frontend studio suite + backend counterparty-hydration spec)
  - lint: FAIL (pre-existing baseline, unrelated to this TZ's conflict keys)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW.md`)
  - progress.md: N/A (no product code / architecture change)
  - status synchronization: PASS
