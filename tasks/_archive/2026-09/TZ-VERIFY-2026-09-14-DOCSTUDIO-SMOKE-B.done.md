# TZ-VERIFY-2026-09-14-DOCSTUDIO-SMOKE-B: добить live smoke pack + successors

**РОЛЬ АГЕНТА:** Executor verify-only (claude) — product-код только hotfix ≤15 строк on-path FAIL; иначе FAIL + deferred TZ  
**ЗАВИСИМОСТИ:** `TZ-VERIFY-2026-09-14-DOCSTUDIO-FOLLOWUPS` = **VERIFY PASS** (`2eb4a4d9` / audit)  
**LAYER:** 4 · **SIZE:** S  
**PAGES:** `/studio/:id` · shell  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`

**CONFLICT KEYS:**  
`docs/audits/2026-09-14-docstudio-smoke-b-verify.md` (создать) ;  
`docs/agent-checklists/WAVE-2026-09-13-DOCSTUDIO-FOLLOWUPS.md` (Checkpoint) ;  
`docs/agent-checklists/_NOW.md` ;  
`docs/agent-checklists/STREAM-QUEUE.md`

### Зачем

VERIFY-A закрыл 6/11 live сценариев. Остались готовые smoke-скрипты волны, которые **не** перегонялись в независимом VERIFY. Плюс короткий регресс Successors WAVE2–3 (issuer / цена·сумма / токен-чип), уже на main.

### ЧТО ДЕЛАТЬ

1. Baseline: tip ≥ `2eb4a4d9`. `_active` пуст. Local stack up (`node start.mjs --nx` или эквивалент). Если login throttle — restart backend, Mongo volume не трогать.
2. **Перегнать (fresh) эти скрипты — все must PASS:**
   - `scripts/tz-nx-text-block-category-inline-create-smoke.mjs`
   - `scripts/tz-nx-docstudio-selected-insert-party-text-smoke.mjs`
   - `scripts/tz-nx-docstudio-table-width-by-header-smoke.mjs`
   - `scripts/tz-nx-shell-rail-menu-close-smoke.mjs`
   - `scripts/tz-nx-docstudio-table-rows-source-cleanup-smoke.mjs`
3. **Successors regression (минимум 2 из 3, live или API+CDP):**
   - Issuer select: смена «Исполнитель» сохраняется (PATCH 200) — без 403 (уже в A; здесь только UI select видим и value)
   - Таблица: колонка цены с `listPrice` + «Сумма» не пустая/не дубль «Цена» на seeded product (spot preview HTML или Свойства)
   - Холст: `{{token}}` виден как chip в режиме Токены (переключить с default Значения)
4. **Optional one-shot:** прогон VERIFY-A scripts тоже (preview + unscoped + props + passport + library + photo-empty) — если время/throttle позволяют; иначе skip с пометкой «covered by VERIFY-A audit».
5. Audit: `docs/audits/2026-09-14-docstudio-smoke-b-verify.md` — таблица script|PASS|counts · successors · verdict.
6. Checkpoint FOLLOWUPS + `_NOW`. Commit+push docs only if PASS.

### НЕ

- Deploy / wipe / SSH-REMAINDER (LAN отдельный TZ)  
- Чинить FE lint 38 baseline  
- Новые фичи  
- Удалять PROMPT/smoke scripts

### AC

1. 5/5 обязательных smoke PASS (или FAIL + deferred).  
2. ≥2 successors checks PASS.  
3. Audit + IDLE.

### Claim

```
agent_id: claude
claimed_at: 2026-09-14T11:13:36Z
branch: main
baseline_sha: 2eb4a4d9
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-14
closed_by: Claude
verdict: VERIFY PASS
verification:
  - 5 required smoke scripts: PASS (5/5, 39/39 checks)
  - successors: PASS (3/3, exceeds ≥2/3 AC — 17/17 checks)
  - hotfix: none needed (3 bugs found were in the verification script itself, not product code)
  - audit: docs/audits/2026-09-14-docstudio-smoke-b-verify.md
  - status synchronization: PASS (WAVE board + _NOW + STREAM-QUEUE updated)
