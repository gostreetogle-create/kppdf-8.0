# TZ-NX-DOCSTUDIO-S34-FORMULA-DEDUP: один control «Формула»

**РОЛЬ АГЕНТА:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** document-studio
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §3.5
**ЗАВИСИМОСТИ:** S33
**CONFLICT KEYS:** `frontend-nx/.../studio-text-properties.component.ts`
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

Два `<select>` «Формула» с **одинаковым** `data-test="studio-text-formula-select"` (FORMULA_OPTIONS + hardcoded tokens).

## ЧТО ДЕЛАТЬ

1. Оставить **один** select: опции = сумма / НДС / итого (+ % если уже было).
2. Уникальный `data-test`.
3. Удалить мёртвый второй control и дублирующий state.

## КРИТЕРИИ ПРИЁМКИ

1. В свойствах текста ровно один «Формула».
2. Вставка токена в контент работает.
3. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S34-FORMULA-DEDUP.done.md`

---

## Реализация (S34)

`FORMULA_OPTIONS` набор (сумма столбца / НДС / итого с НДС, + пустая опция
«— без формулы —») уже покрывал весь список из ИСХОДНОЕ — новый % пункт не
требовался (в исходном коде его не было ни в одном из двух controls).

Файлы:
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts` —
  удалён второй `<select data-test="studio-text-formula-select">` (bind на
  `formulaPick()` / `insertFormulaToken($event)`, hardcoded `{{table.subtotal}}` /
  `{{table.vat}}` / `{{table.grand}}` токены, без опции «без формулы»). Оставлен
  первый control (`selectedFormulaId()` / `onFormulaPick($event)`, опции из
  `FORMULA_OPTIONS`) — он же вставляет токен в rich-text контент через
  `richText().insertContent(opt.token)`, поведение не менялось. Вместе с
  удалённым control убран и мёртвый state, которым он единолично пользовался:
  `formulaPick` signal, `formulaTokens` object, `insertFormulaToken()` метод.

### Gates (факт)

```text
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, exit 0

cd frontend-nx && pnpm exec nx test kppdf-web (full suite, baseline check)
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    файл вне diff этого TZ, идентично документированному в S31/S32/S33
    (350 passed / 7 skipped / 359 total)

cd frontend-nx && pnpm exec eslint apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts
  → PASS, exit 0, 0 problems

cd frontend-nx && pnpm exec nx lint kppdf-web (full project, baseline check)
  → FAIL: 21 errors / 75 warnings — идентично baseline S33 (96 problems),
    все ошибки вне места правки этого TZ

pnpm architecture:check
  → PASS: "Architecture check passed (1398 files; baseline 17; resolved since baseline: 2)."

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)
```

Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S34-FORMULA-DEDUP.md`

```text
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS for changed-scope (no dedicated spec file); pre-existing baseline FAIL unrelated to this TZ (see Gates)
  - lint: PASS for changed-scope file; pre-existing baseline FAIL unrelated to this TZ (see Gates)
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - progress.md: N/A (не менялся; live-state в `_NOW.md`)
  - status synchronization: PASS
```
