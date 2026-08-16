# TZD-51: Desktop Excel Forms — справочники V2

> **Второй шаг волны** WAVE-DESKTOP-EXCEL-FORMS (скачал → заполнил → загрузил →
> проверка → подтвердил → SoT). Расширяет Form Studio (TZD-50) на справочники:
> склады / виды работ / цвета RAL / категории.
>
> РОЛЬ АГЕНТА: Desktop UI + Desktop core (Svelte/Tauri); без frontend SPA;
> BE не трогал (POST `/api/warehouses|work-types|color-references|categories` уже
> существовали на Nest).
>
> ЗАВИСИМОСТИ: TZD-50 archived DONE. TZD-49 PARK — не трогал.

LAYER: 3 (Desktop core + App.svelte; CLAIM единственный — TZD-49 PARK не параллелился)

CONFLICT KEYS: `desktop/src/App.svelte` ; `desktop/src/core/import-targets.ts` ;
`desktop/src/core/excel-form-template.ts` ; `desktop/src/core/excel-form-template.test.ts` ;
`desktop/src/core/multi-import.ts` ; `desktop/src/core/multi-import.test.ts` ;
`docs/agent-checklists/TZD-51.md` ; `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md`

CHECKLIST: `docs/agent-checklists/TZD-51.md`
REVIEW: required (Cursor Verdict **PASS** 2026-08-16 до archive)

---

## Что сделано (коротко)

1. **Form Studio → Справочники:** категория `references` «Справочники» с 4 таблицами
   (warehouse/workType/colorReference/category); RU-колонки, обязательные с ` *`,
   `_kppdf`-форма через генератор TZD-50.
2. **Валидация строк:** enum type (склад/категория), hex `#RRGGBB`, `hourlyRate ≥ 0`,
   `skuPrefix /^[A-Z0-9-]+$/`, `slug /^[a-z0-9-]+$/` → `invalid` в отчёте, не пишется.
3. **Dedupe до POST:** склады/виды работ по name (trim+lower), цвета по name/slug,
   категории по `type+slug` или `skuPrefix`; совпадение → `duplicate`, не пишется.
4. **Write path:** POST `/api/warehouses|work-types|color-references|categories` +
   Policy A confirm; `organizationId` цветов — с сервера (не из Excel).
5. **UX:** «Slug и префикс SKU лучше латиницей; префикс — заглавными»;
   «Ставка 0 = явно бесплатно»; «справочники пишутся сразу после подтверждения».

## Verification

- `cd desktop && npx tsc --noEmit` → **PASS** (0 ошибок)
- `cd desktop && npx svelte-check --threshold error` → **PASS** (0 errors, 0 warnings)
- `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts` → **PASS 64/64** (+8 новых)
- checklist: DONE (`docs/agent-checklists/TZD-51.md`)
- cursor verdict: PASS (2026-08-16, до closeout)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T18:50:00+03:00
closed_by: freebuff (deepseek-v4-pro)
TZ: TZD-51
DEP: TZD-50 (archived DONE); TZD-49 PARK

verification:
  - acceptance criteria: PASS (все чекбоксы TZD-51 + Cursor Verdict PASS)
  - typecheck: PASS (desktop tsc --noEmit)
  - svelte-check: PASS (0 errors, 0 warnings)
  - desktop tests: PASS 64/64 (+8: allowlist V2, identity mapping, round-trip warehouse/category, dedupe складов, workType без ставки, цвет bad hex, категория bad skuPrefix/slug/type)
  - checklist: DONE (docs/agent-checklists/TZD-51.md, Status DONE + Executor report (auto))
  - cursor verdict: PASS (2026-08-16, spot-check: references×4, validate/dedupe, POST branches, tests 26 focused PASS; V1 intact)
  - commit: 76aa08c73706486d0f69fa0c528b2f97b9772f71 (feat(desktop): Excel Forms справочники V2 — склады/виды работ/цвета/категории (TZD-51))
  - push: НЕ делал (по GIT-POLICY / слову PO)

## Files

- `desktop/src/core/import-targets.ts` (`ImportTargetKey` + 4 справочника + `REFERENCE_TARGET_KEYS` + `isReferenceTargetKey`)
- `desktop/src/core/excel-form-template.ts` (категория `references` + 4 `FORM_TEMPLATES`)
- `desktop/src/core/multi-import.ts` (+test) (`referenceDedupeKeysOf`, `validateReferenceRows`)
- `desktop/src/core/excel-form-template.test.ts`, `desktop/src/core/multi-import.test.ts`
- `desktop/src/App.svelte` (`createEntities` 4 ветки POST; `fetchDedupeKeys`; confirm-текст)
- `docs/agent-checklists/TZD-51.md`
- `tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-FORMS.md` (DoD чекбокс)

## Known limits (successor)

- TZD-49 journal unify — PARK, не тронут
- parentId дерево категорий — не строится
- Справочники создают новые записи (нет PATCH/обновления)
- Smoke-прогон нового ZIP → ручной, после публикации Desktop
