# TZ-NX-GANTT-G7-SMOKE-DOCS — DONE

**Дата:** 2026-09-05 · **Executor:** Freebuff (Buffy) · **Волна:** WAVE-NX-PRODUCTION-GANTT (финал)
**Checklist:** `docs/agent-checklists/TZ-NX-GANTT-G7-SMOKE-DOCS.md`
**Evidence:** `docs/audits/2026-09-05-gantt-nx-smoke.md` (HEAD `26b87bc3`)

## Acceptance Criteria

1. **Evidence smoke md + HEAD SHA** — ✅ `docs/audits/2026-09-05-gantt-nx-smoke.md`, HEAD `26b87bc31d1257cc8947629a9b55d53b4874a7ff`.
2. **WAVE closeout [x]; `_active/` пуст** — ✅ все G0–G7 [x], `tasks/_active/` пуст после архивации.
3. **`nx build kppdf-web` PASS на финальном HEAD** — ✅ (ре-прогон G7).

## Live smoke (кратко)

Логин admin → nav «Производство» → `/production`: 8 активных заказов, легенда WT, шкала День + today-маркер.
Каскад З-2026-009: изделие «Калитка «Классик» ×4» → Рама (17.07–22.07) → Заполнение (23.07–15.08) → WT-бары с ФИО исполнителей.
Drag сводной З-2026-002 +3д: `2026-07-28→2026-08-14` → `2026-07-31→2026-08-17`, `PATCH /api/orders/… → 200`, scroll 0→0 (G4 no-stick живьём).
Workers: 4 группы «Рабочий: …·сводно Nд», tinted dominant WT; обратно — дерево сохранилось.
Сегодня → scroll 1722; Fit+Месяц → 3 месячных тика; День → 58 тиков. Console: 0 ошибок.

## Jest

68/69 suites, 435 tests green. Fail только `registries.catalog.spec` (2) — pre-existing чужой волны (`59bcf499`), вне conflict keys (помечено ещё в G3).

## Docs

- `production-cockpit.page.md` → NX SoT (`NX PORT DONE`, карта файлов по G, L1–L6 + NX-gaps).
- `PAGE-TZ-INDEX.md` строка `/production`.
- `_NOW.md`, `QUEUE-LIVE.md`, WAVE closeout.

## Known gaps (честно)

- Live-роли: только admin (остальные — jest).
- Drag синтетический (pointer-events), семантика идентична jest write-path.
- Photo-URL resolution legacy facade не портирован (нет NX photo-клиента) — задокументировано в page doc.
