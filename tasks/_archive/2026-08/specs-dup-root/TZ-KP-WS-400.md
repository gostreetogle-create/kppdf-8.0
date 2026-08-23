# TZ-KP-WS-400: Pre-implementation audit — KP Single Workspace

**РОЛЬ АГЕНТА:** architect-auditor (docs-only)  
**DEPENDENCIES:** Wave 0 PASS (`/proposals/demo-workspace`)  
**LAYER:** docs  
**WAVE:** `WAVE-KP-SINGLE-WORKSPACE` #0  
**PAGES:** `/proposals/demo-workspace` ; `/proposals/create`  
**PAGE_DOCS:** `kp-workspace-geometry.md` ; `proposals-create.page.md`  
**CONFLICT KEYS:** `docs/audits/2026-08-23-kp-workspace-implementation-audit.md`; `docs/pages/kp-workspace-rail-ia.md`

Проверено: `proposal-create.page.ts`; `docs/pages/proposals-create.page.md`; `docs/ux/kp-create-studio-spec.md`; `desktop/mcp/src/doc-tools.ts`; `docs/audits/2026-08-23-kp-single-workspace-program.md`

## ИСХОДНОЕ СОСТОЯНИЕ

- Production create = dual L/R flyouts, 7 overlay panels, autosave Quotation API — **310–379 DONE**.
- Demo workspace = geometry only, placeholder panel sections.
- Doc settings = `/doc-constructor/*`; create navigates away for builder/tables.
- MCP creates empty `[AI-DRAFT]` templates; no PDF→blocks parser.
- PO цель «одно место» **не** была в старом roadmap dummy README (только layout waves).

## ЧТО ДЕЛАТЬ

1. Прочитать `proposal-create.page.ts` + все `proposal-create-*.component.ts` + `proposal-product-rail.component.ts` — составить **parity matrix** (функция → файл → data-test → API).
2. Составить **state ownership map**: что живёт на `Quotation`, что на `DocumentTemplate`/`TableTemplate`/`TextBlock`, что request-only в build.
3. Спроектировать **final rail IA** (left/right/ribbon): таблица секций, иконки Lucide, tier S/L панелей, dedup (нет двух `FileText` и т.д.) → `docs/pages/kp-workspace-rail-ia.md`.
4. **Icon/button audit:** все `data-test="kp-create-toggle-*"`, ribbon actions, duplicates vs demo rail — матрица «оставить / переименовать / убрать / перенести на right».
5. **MCP readiness audit:** список tools из `desktop/docs/MCP.md` релевантных КП/шаблонам; gap для «файл → draft template»; что нужно в BE/FE в 405–406 (без реализации).
6. **Embedded settings scope:** какие операции из `/doc-constructor/tables|texts|builder` можно inline в workspace на Wave 405 vs must navigate (full builder canvas).
7. **Multi-supplier flows:** copy, family attach, org change + template pick — as-is gaps.
8. Записать **parity test plan** (Jest patterns + manual KP-E2E-SMOKE rows) для cutover 408.
9. Выходной файл: `docs/audits/2026-08-23-kp-workspace-implementation-audit.md` (≤200 строк + приложения таблицами).

## ИЗМЕНЯТЬ

- `docs/audits/2026-08-23-kp-workspace-implementation-audit.md` (create)
- `docs/pages/kp-workspace-rail-ia.md` (create)
- `docs/audits/2026-08-23-kp-single-workspace-program.md` (patch § gaps if new facts)
- `tasks/kp-workspace-dummy/README.md` (roadmap → ссылка на WAVE)
- `docs/pages/PAGE-TZ-INDEX.md` (строка TZ-KP-WS-400)

## НЕ ИЗМЕНЯТЬ

- `frontend/**` product code
- `backend/**`
- Frozen spec `docs/ux/kp-create-studio-spec.md` (только ссылка/supersede note в audit)
- `/proposals/create` behavior

## КРИТЕРИИ ПРИЁМКИ

- [ ] Audit doc содержит parity matrix ≥25 строк (каждый flyout + output + catalog review)
- [ ] State ownership map: ≥10 полей Quotation с источником truth
- [ ] Rail IA doc: left ≥3 секции, right ≥4, ribbon actions listed, Lucide icon per section
- [ ] Icon dedup: явный список конфликтов demo vs create → resolution
- [ ] MCP section: ≥5 existing tools + ≥3 gaps + Wave 406 recommendation
- [ ] Embedded settings: ≥3 inline candidates + ≥2 must-stay-navigate with rationale
- [ ] Multi-supplier: documented copy + org switch + family attach paths
- [ ] Parity test plan references existing spec files by name
- [ ] PO CANON не править (только audit ссылается на geometry law)

## known_limitation

- PDF/image layout parsing — out of scope; только architectural hook.

## Archive

`tasks/_archive/2026-08/TZ-KP-WS-400.done.md` + checklist `docs/agent-checklists/TZ-KP-WS-400.md`
