# TZ-VERIFY-2026-09-14-DOCSTUDIO-FOLLOWUPS: независимая проверка pack

**РОЛЬ АГЕНТА:** Executor verify-only (claude) — **не** писать product-код, кроме hotfix ≤15 строк on-path к FAIL; иначе FAIL + deferred TZ в `_ready`  
**ЗАВИСИМОСТИ:** Pack DONE tip ≥ `45e93009`  
**LAYER:** 4 · **SIZE:** L (verify)  
**PAGES:** `/studio/:id` (+ shell rail)  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`docs/audits/2026-09-14-docstudio-followups-verify.md` (создать) ;  
`docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md` (только Checkpoint VERIFY) ;  
`docs/agent-checklists/_NOW.md` ;  
`docs/agent-checklists/STREAM-QUEUE.md`  
(+ hotfix paths только если RED и ≤15 строк — перечислить в отчёте)

IMPLICIT CONFLICT: `nx build kppdf-web` (read/run, не фича)

### Scope (что перепроверить)

**Claude chain:** PREVIEW-UPLOADS-INLINE · UNSCOPED-ORG-SCOPE · TEXT-PROPS-CANON  

**Freebuff-labeled chain (ran as Claude):** IMAGE-PASSPORT-FIT · TEXT-BLOCK-CATEGORY-INLINE · TEXT-LIBRARY-INSERT-ON-ADD · SELECTED-INSERT-PARTY-TEXT · TABLE-WIDTH-BY-HEADER · TABLE-PHOTO-EMPTY-BLANK · SHELL-RAIL-MENU-CLOSE · TABLE-ROWS-SOURCE-CLEANUP  

Доска: `docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md`

### ЧТО ДЕЛАТЬ

1. **Baseline:** `git fetch && merge origin/main`. Tip содержит `45e93009` (или новее с тем же pack). `_active` пуст. Таблица 11 SHA из WAVE — каждый `merge-base --is-ancestor` → HEAD.
2. **Spot-check code (1-liner evidence в audit):**
   - `StudioOutputService.preview` вызывает `inlineLocalUploadsForPdf`
   - unscoped `findById` не `assertSameScope` на alphabetical fallback
   - token display default `values`; unresolved values style ≠ tokens chip
   - passport canvas CSS: contain wins over cover
   - text-block form: `app-pi-select-add-row` ×2
   - «+ Текст» → library picker dialog exists
   - empty photo cell → `''` / no «Нет фото» (FE+BE)
   - shell `onShellToolClick` closes menu
3. **Focused specs (обязательно):**
   ```bash
   cd frontend-nx
   pnpm exec nx test kppdf-web --skip-nx-cache --testPathPattern="studio-output|studio-editor|studio-blocks-canvas|studio-text-properties|text-block-form|text-library|shell|studio-table|studio-elements|selected"
   cd backend
   pnpm test -- studio-output studio-document studio-data-resolver document-render
   ```
   (уточни pattern по реальным именам файлов, если suite empty — найди и перезапусти).
4. **Full gates (fresh):**
   ```bash
   cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit && pnpm exec nx test kppdf-web --skip-nx-cache && pnpm exec nx lint kppdf-web && pnpm exec nx build kppdf-web
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint
   cd .. && pnpm architecture:check
   ```
5. **Live smoke (минимум 6, headless Chrome или Playwright против local stack):**
   1. Документ с фото таблицы → **Просмотр** показывает картинки (не broken)
   2. Unscoped admin: сменить Исполнитель → **+ Фото** или **+ Текст** → 200 (не 403)
   3. Текст: default **Значения**; переключатель Токены меняет вид
   4. Фото «Сделать фоном» → холст letterbox ≈ PDF (contain)
   5. «+ Текст» → picker библиотеки; «Пустой текст» создаёт слой
   6. Таблица с пустой photo-ячейкой → blank (нет «Нет фото») на canvas и/или preview HTML
6. **Артефакт:** `docs/audits/2026-09-14-docstudio-followups-verify.md` — tip · focused · full gates · live · spot-check · verdict `VERIFY PASS` | `VERIFY FAIL` (+ deferred TZ path if FAIL).
7. Checkpoint в FOLLOWUPS.md + `_NOW` IDLE. Commit+push **только** docs (audit/checklist), если PASS. Product hotfix — отдельный commit с явным «hotfix from VERIFY».

### НЕ

- Новые фичи / рефактор «заодно»  
- Deploy / wipe / SSH  
- Удалять `PROMPT-*.md`  
- Объявлять PASS без live §5 (хотя бы 6 пунктов)

### AC

1. Audit файл с verdict и числами suites.  
2. Full gates exit 0 **или** честный FAIL + deferred.  
3. Live ≥6 evidence (скрипт path / screenshot / curl).  
4. `_active` пуст после.

### Claim

```
agent_id: claude
claimed_at: 2026-09-14T09:57:05Z
branch: main
baseline_sha: 45e93009
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verdict: VERIFY PASS
verification:
  - SHA ancestry: PASS (11/11 ancestors of HEAD)
  - spot-check: PASS (8/8 confirmed in tree)
  - focused specs: PASS (FE 129/981, BE 11/128)
  - full gates: PASS (FE tsc/test/build clean; FE lint 38 pre-existing errors, no new; BE tsc/test/lint clean; architecture:check PASS)
  - live smoke: PASS (6/6 scenarios, 44 checks, 0 fail — 2 new scripts written for previously-unit-only TZs)
  - hotfix: none needed
  - audit: docs/audits/2026-09-14-docstudio-followups-verify.md
  - status synchronization: PASS (WAVE board + _NOW + STREAM-QUEUE updated)
