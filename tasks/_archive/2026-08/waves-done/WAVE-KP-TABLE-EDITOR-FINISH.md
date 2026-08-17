# WAVE-KP-TABLE-EDITOR-FINISH — дожать до прода (unattended)

**Зачем:** код 359–361 уже почти готов, но **не на `origin/main`**.  
Нужно: land → добить chrome Рамка/Шапка (канон §6.9) → DnD строк → warm deploy.

**Канон:** `docs/audits/2026-08-12-kp-table-editor-unified-canon.md`  
**Промпт:** `tasks/_backlog/kp-vitrine/PROMPT-KP-TABLE-EDITOR-UNATTENDED.md`  
**Порядок строгий: A → B → C → D → E.**  
**Этим промптом PO авторизует warm deploy в конце (без wipe).**

---

## Правда на старте (проверено 2026-08-12)

| Факт | Где |
|------|-----|
| `origin/main` ≈ `67da760f` | Table Studio + photoUrl + flyout S/L (362) + 363 |
| Unified editor **не** в `main` | нет `proposal-create-table-editor.component.ts` |
| WIP 359–361 | worktree `.freebuff/worktrees/aecefc4d-49f5-492f-977e-b02fe41f20ba` (base старый `d47925c3`) |
| `photoUrl` BE | уже на `main` — не дублировать |
| Desktop dirty / `ruvector.db` | **не трогать, не коммитить** |

---

## A — LAND: 359→361 на `main` (один коммит или 3 мелких)

**LAYER:** 3  
**CONFLICT KEYS:**

```text
frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create-composition.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create-table-studio.component.ts
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts
frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts
docs/pages/proposals-create.page.md
docs/agent-checklists/_active-map.md
progress.md
scripts/architecture-check.baseline.json
```

**ЧТО ДЕЛАТЬ**

1. `git checkout main && git pull --ff-only`.
2. Источник кода редактора: worktree `aecefc4d…/…/proposal-create-table-editor.component.ts`  
   (или пересобрать по `WAVE-KP-TABLE-EDITOR.md`, если worktree пропал).
3. Влить в **актуальный** `proposal-create.page.ts` (на main уже есть S/L тиры, ScrollText, photoUrl):
   - рейл: **Параметры · Редактор таблицы · Условия** (3 кнопки);
   - удалить composition + table-studio из DOM/imports;
   - `rightPane = 'params' | 'table' | 'terms'`;
   - flyout table = L (`--kp-flyout-l` / 794px);
   - один write-path строк (`onCompositionLineChange` и т.п.).
4. Spec: 3 кнопки справа; `data-test="kp-table-editor"`; нет `kp-create-toggle-composition` / `kp-table-studio`.
5. BE quotation photoUrl — **только если** на main ещё нет (сейчас есть → skip).
6. Gates → archive 359/360/361 (если ещё не) → **commit+push**.

**AC:** канон §6 п.1–8, 10–13; FE tsc; `proposal-create.page.spec.ts` PASS; `architecture:check` PASS.

---

## B — TZ-SALES-364: Рамка + Шапка в редакторе

**Зависимость:** A на `origin/main`.  
**CONFLICT KEYS:** `proposal-create-table-editor.component.ts`; `proposal-create.page.ts`; page spec; page.md

**ЧТО ДЕЛАТЬ**

1. Перенести toolbar «Рамка» (thin|normal|thick) и «Шапка» (normal|bold) из старого table-studio.
2. Inputs/outputs: `chrome` / `chromeChange` → page `kpTableChrome` / `onTableChromeChange` (уже есть на page).
3. Живая таблица редактора отражает `data-border` / `data-header`; A4 через существующий build `tableChrome`.
4. Read-only → chips disabled.

**AC:** канон §6 п.9; FE tsc + focused spec.

---

## C — TZ-SALES-365: DnD порядка строк

**Зависимость:** A.  
**CONFLICT KEYS:** `proposal-create-table-editor.component.ts`; page.spec.ts; page.md

**ЧТО ДЕЛАТЬ**

1. Drag handle на служебном жёлобе (рядом с `↑↓`); drop меняет порядок через тот же `move` / page handler.
2. `↑↓` **оставить** (клавиатура / точность).
3. Read-only → drag off.
4. После DnD: draftLines + A4 + Итого согласованы (один write-path).

**AC:** перетащил 3 строки → порядок в редакторе = на A4 после rebuild; FE tsc + spec.

---

## D — Документы волны + checkpoint

- `docs/pages/proposals-create.page.md` — рейл из 3, редактор, chrome, DnD.
- `_active-map.md` Checkpoint: WAVE DONE; NEXT idle или deploy.
- WAVE файлы → STATUS DONE + SHA.
- `pnpm architecture:check` если трогал baseline.

---

## E — Warm deploy (авторизован этим промптом)

```powershell
.\deploy\synology\deploy.ps1
```

- **Без** `-Wipe`. `-Seed` только если PO отдельно написал в чате (в unattended — **нет**).
- Preflight OK → дождаться «Deploy complete» + health 200.
- Checkpoint: Deploy YES + время + health URL.
- Короткий отчёт PO.

---

## Out of scope

PATCH shared TableTemplate · правка в iframe A4 · Desktop · wipe · новые фичи вне A–E.

## Gates (каждая ступень)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern=proposal-create.page --no-coverage
cd backend  && pnpm exec tsc -p tsconfig.build.json --noEmit   # если трогал BE
cd <root>   && pnpm architecture:check                        # если трогал baseline / крупные FE
```
