# TZ-NX-PRE-UAT-SMOKE-2026-09-12: предварительная проверка перед PO

**РОЛЬ АГЕНТА:** Executor (frontend-nx + backend + scripts) — claude  
**ЗАВИСИМОСТИ:** нет (слот IDLE)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/registries`, `/studio/:id`, `/storage-items`, shell nav  
**PAGE_DOCS:** `registries.page.md` ; `document-studio.page.md`

**CONFLICT KEYS:**  
`scripts/pre-uat-smoke-2026-09-12.mjs` (create) ;  
`docs/audits/2026-09-12-pre-uat-smoke.md` (create) ;  
`docs/audits/evidence/pre-uat-2026-09-12/` (create) ;  
`docs/agent-checklists/WAVE-NX-PRE-UAT-SMOKE.md` ;  
`docs/agent-checklists/_NOW.md` ;  
`docs/agent-checklists/STREAM-QUEUE.md` ;  
плюс **только** файлы тестов/фиксов, которые реально падают в шагах ниже (указать в отчёте)

IMPLICIT CONFLICT: nx build kppdf-web; backend tsc/jest focused

### Preflight Check Output
- **Context read:** `SMOKE-2026-09-03-CURSOR.md`; `scripts/tz-nx-hub-05-visual-parity-smoke.mjs` (CDP pattern); WAVE COMPLETE recent (DocStudio table, Categories, Drop-nav, AI-IMPORT)
- **Key Constraints:** не deploy/wipe; не Soup train; не полный UX-sweep всех страниц; чинить только FAIL с evidence
- **Planned Deliverable:** smoke script + audit PASS/FAIL для PO + недостающие focused tests
- **Validation Path:** HTTP + Jest/nx + Chrome CDP; audit markdown

## Цель

Снять с PO ручной «тыкательный» обход: агент сам поднимает/проверяет стенд, гоняет критичные пути **свежих волн**, пишет/чинит тесты на дыры, отдаёт короткий отчёт «что можно не перепроверять» / «что красное».

## ЧТО ДЕЛАТЬ

### A. Стенд
1. Убедиться: API health `:3000`, NX `:4201` (или зафиксировать фактические порты). Если не поднято — поднять по `docs/how-to-connect-ai.md` / launcher без wipe.
2. Логин admin (существующие seed credentials из docs — не хардкодить секреты в git; env/local).

### B. Gates (обязательно)
```
cd frontend-nx && pnpm exec nx run kppdf-web:test --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test
```
(или эквивалент из GEMINI.md; зафиксировать exit codes в audit).  
Падения → **чинить** минимально + тест, не «skip».

### C. Chrome CDP smoke (новый скрипт, reuse hub-05 pattern)
`scripts/pre-uat-smoke-2026-09-12.mjs` — headless Chrome, login, assert DOM:

| # | Маршрут / действие | Ожидание (свежие волны) |
|---|--------------------|-------------------------|
| 1 | Shell | **нет** chip «Справ.» / reference |
| 2 | `/registries` | группы: Каталог **без** units; Справочники: units + Категории; Документы: Тексты + Категории текстов + Виды таблиц |
| 3 | `/registries/categories` | create form type select (Детали/Изделия/Модули) виден или list non-empty / empty-state честный |
| 4 | `/registries/details` create | поле Категория = **select**, не raw ObjectId |
| 5 | `/registries/table-templates` | реестр открывается |
| 6 | `/studio` → открыть/создать doc → select table | props panel width ≥ ~700px; есть chip «+ Количество» или колонка qty; CTA «Реестры → Виды таблиц» |
| 7 | Table photo cell | `<img>` **или** текст «Нет фото» (не пустая td) |
| 8 | `/storage-items` put-on-stock (если UI) | material = search/typeahead, не только blind full select (если диалог доступен) |
| 9 | Console | нет app uncaught errors на этих шагах (extension noise ignore) |

Screenshots → `docs/audits/evidence/pre-uat-2026-09-12/`.  
JSON report → `docs/audits/evidence/pre-uat-2026-09-12/report.json`.

### D. Тесты
Где smoke FAIL или нет регрессии:
- добавить/починить **focused** Jest/nx specs (не e2e-framework ради спорта);
- приоритет: registries categories select, studio table props width/qty unlock, nav no-reference.

### E. Desktop (optional, если время)
- `cd desktop &&` tsc + existing tests; AI-IMPORT: normalize fixtures already green — не требовать Ollama live.  
- GUI Desktop pairing — **не** блокер (отметить SKIP + why).

### F. Audit для PO
`docs/audits/2026-09-12-pre-uat-smoke.md`:
- таблица PASS/FAIL/SKIP;
- **«PO может не кликать»** — зелёные пункты;
- **«PO смотри глазками»** — только FAIL или flaky;
- SHA fixes.

## НЕ

- wipe / deploy / Soup train / TZD-76  
- полный UX-sweep всех admin/kit страниц  
- «починить заодно» соседний долг без FAIL evidence  
- native confirm / invent features

## AC

1. Audit markdown + evidence folder существуют.  
2. Smoke script runnable: `node scripts/pre-uat-smoke-2026-09-12.mjs`.  
3. Gates B: PASS или FAIL с фиксом в том же claim.  
4. Нет chip «Справ.»; registries IA + studio table qty/photo asserts в smoke или unit tests.  
5. Executor report: SHA + «что PO не обязан перепроверять».  
6. Archive TZ; `_NOW` IDLE.

---

**ARCHIVE_MARKER:** DONE 2026-09-12T01:45:00Z — see docs/agent-checklists/TZ-NX-PRE-UAT-SMOKE-2026-09-12.md for SHA
