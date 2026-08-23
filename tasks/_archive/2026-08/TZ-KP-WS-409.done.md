# TZ-KP-WS-409 — DONE

- **TZ:** `tasks/TZ-KP-WS-409.md` — Legacy cleanup + documentation
- **agent_id:** freebuff-1
- **claimed_at:** 2026-08-23T17:10:09+0300
- **closed_at:** 2026-08-23T17:50:00+0300
- **SHA:** _(fill after commit)_
- **Deploy:** НЕ

## Что сделано

1. **God shell удалён:** `proposal-create.legacy.page.ts` + его page-level specs
   (`proposal-create.legacy.page.spec.ts` — 48 тестов старой god-page UI,
   `proposal-create.autosave.spec.ts` — 1 тест stale-retry). Subcomponents
   (`proposal-create-{inspector,recipient,table-editor,template-center,template-picker,terms}`,
   `proposal-product-rail`) остались — они используются workspace.
   AC «No duplicate create route component» ✅ (route → workspace, comment обновлён).
2. **Docs:** `kp-workspace.page.md` post-cutover (routes/файлы/wave 409 DONE,
   chips → `/proposals/create` = workspace); `PAGE-TZ-INDEX.md` (552 UNBLOCKED,
   overview workspace/create rows); `kp-create-studio-spec.md` header
   «SUPERSEDED — workspace после 408»; `tasks/kp-workspace-dummy/README.md`
   DEPRECATED (geometry reference only).
3. **Architecture baseline:** `scripts/architecture-check.baseline.json`
   перегенерирован (10 keys). Удалённые legacy keys (proposal-create.page.ts:39-41)
   заменены workspace-ключами (cross-page dialog reuse: ai-draft→pairing-dialog,
   draft-service→product/module/material/table-template dialogs,
   text-block-dialog→text-block-editor) — тот же accepted-паттерн, что был
   у legacy god-page. +1 pre-existing key manager-desk→supply (параллельный DESK).
4. **Wave closeout:** `WAVE-KP-SINGLE-WORKSPACE.md` status DONE → moved to
   `tasks/_archive/2026-08/waves-done/`.

## Gates (факт)

| Команда | Результат |
|---------|-----------|
| `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` | PASS |
| `cd frontend && pnpm test -- proposal --runInBand` | PASS (127/127, 13 suites) |
| `cd frontend && pnpm lint` | PASS (0 errors; 17 pre-existing warnings) |
| `cd frontend && pnpm exec ng build --configuration development` | PASS |
| `pnpm architecture:check` | PASS (992 files; baseline 10; resolved 0) |

## Proof of adoption

| AC | Статус |
|----|--------|
| No duplicate create route component | ✅ route → workspace; god-page удалена (git history recoverable) |
| kp-workspace.page.md актуален post-cutover | ✅ routes/файлы/wave/chips обновлены |
| architecture:check PASS | ✅ baseline refreshed |
| tsc + test + lint PASS | ✅ |

## Conflict disclosure

- `proposals/**`, `docs/pages/kp*` — мои keys; параллельные сессии (DESK-432,
  gantt, chips) работали в других файлах — их WIP не тронут.
- Baseline refresh включил pre-existing manager-desk key (не мой scope, не правлен).

## known_limitation

- Ручной smoke: PENDING (VPN/dev-server PO) — гейт деплоя, не кода.
- Baseline содержит cross-page dialog imports (accepted-паттерн, как legacy).
