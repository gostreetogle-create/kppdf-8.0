# TZ-NX-UX-08-warehouses-AUDIT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-UX-08-warehouses-AUDIT.md` (removed after archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-09T17:30:29Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM (`_active/` пуст, только `.gitkeep`)
- [x] TZ / канон / deps прочитаны: canon sweep, `warehouses.page.ts`, `warehouse-form-dialog.component.ts`, `Warehouse`/`WarehouseWritePayload` types, `ButtonComponent` (`button.component.ts`), exhaustive grep of all CSS files + tailwind configs + git history for `pi-button-*` class definitions
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-UX-08-warehouses-AUDIT.md` на месте (до archive)

### Preflight Check Output
- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts`, `warehouse-form-dialog.component.ts`, `frontend-nx/libs/data-access/src/lib/warehouse/pi-warehouses.service.ts`, `frontend-nx/libs/ui/paper-and-ink/src/lib/button/button.component.ts`, all 6 `.css` files in `frontend-nx/**`, `frontend-nx/tailwind.config.ts`, `frontend-nx/libs/ui/paper-and-ink/tailwind.config.ts`, `apps/kppdf-web/project.json` (styles array)
- **Key Constraints:** audit-only, no product code, single file `warehouses.page.ts` per conflict keys (dialog read as directly-connected write-flow, not separately named)
- **Planned Deliverable:** `docs/audits/2026-09-09-nx-ux-warehouses-audit.md` with T1–C1 table + verdict
- **Validation Path:** verdict PASS-FIX → claim FIX TZ next in same wave-cycle, scoped to this page only

## Acceptance

- [x] Audit file exists with every checklist row marked OK/FAIL/N/A.
- [x] No product code in commit.
- [x] Verdict PASS-FIX → FIX TZ claimed next (not skipped).

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: docs-only (audit)
- [x] FIC §A–E: N/A (audit produces no product/page/permission change)
- [x] page.md / PAGE-TZ-INDEX: N/A for this AUDIT step (FIX step adds NX UX note to `docs/pages/warehouses.page.md` per its own criteria)
- [x] DOMAIN-MAP: N/A (no route/module contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`docs/audits/2026-09-09-nx-ux-warehouses-audit.md`, WAVE row 08 — оба заявлены в TZ)
- [x] Coupling map: N/A (no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — соблюдён (docs-only closeout)

## Gates (факт)

- Docs-only TZ: код не менялся, typecheck/tests/lint/nx build не применимы к этой волне (audit-only).

## Executor report

- Прочитан `warehouses.page.ts` (213 строк) + `warehouse-form-dialog.component.ts` (129 строк, прямой write-flow этой страницы).
- **Найден 1×P0, но это cross-cutting находка, а не обычный page-smell:** `pi-button`/`pi-button-primary`/`pi-button-secondary`/`pi-button-outline` — **не существующие CSS-классы**. Исчерпывающая проверка: единственный загружаемый stylesheet (`global.css`) не содержит определения (только doc-comment, упоминающий реальный `<app-pi-button>`); ни один другой `.css`-файл в `frontend-nx/**` тоже не определяет; `git log --all -S "pi-button-primary {"` — ни одного коммита за всю историю; tailwind config минимален, без плагина, генерирующего эти классы. Реальный, рабочий канонический компонент — `<app-pi-button variant="...">`, вычисляющий полностью стилизованные Tailwind-классы сам через `variant`/`size` inputs.
- **Blast radius: 18 файлов** используют этот несуществующий паттерн классов, включая **4 страницы этой же волны, уже помеченные DONE** (`orders-list.page.ts` #04, `shipping.page.ts` #05, `supply.page.ts` #06, `supply-requests.page.ts` #07) — именно поэтому A1 в тех четырёх аудитах читался «OK»: я оценивал консистентность именования между соседними страницами как признак корректности, ни разу не проверив, что у класса есть реальный CSS.
- Audit и FIX этого TZ **остаются в рамках `/warehouses`** (conflict keys + «НЕ: другие routes») — остальные 17 файлов **не тронуты**, находка явно вынесена в Executor report для решения PO о cross-cutting ремедиации.
- Остальной чеклист T1-C1 для `/warehouses` чист — самая простая и честная страница волны, без hidden-data проблемы (T1 реально N/A, не «пропущено»).
- Verdict: **PASS-FIX**.
- Продуктовый код не менялся в этом TZ (audit-only).
- Файлы: `docs/audits/2026-09-09-nx-ux-warehouses-audit.md` (создан), `docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md` (row 08 → PASS-FIX + предупреждение в header), `docs/agent-checklists/TZ-NX-UX-08-warehouses-AUDIT.md` (этот файл), `tasks/_active/TZ-NX-UX-08-warehouses-AUDIT.md` (создан → удалён при archive).
- Next: claim `TZ-NX-UX-08-warehouses-FIX` в этой же сессии — чинить ТОЛЬКО `/warehouses` (list + form dialog), затем явно сообщить PO о cross-cutting находке в финальном summary.

## Review handoff

- [x] Review не требуется по TZ (audit-only, docs); explicit review gate в TZ не указан. **Cross-cutting находка требует внимания PO** — см. Executor report.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- Status = DONE
- closed_at: 2026-09-09T17:50:00Z
