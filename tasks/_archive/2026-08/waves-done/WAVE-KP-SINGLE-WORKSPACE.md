# WAVE-KP-SINGLE-WORKSPACE

> **Status: DONE** (2026-08-23 — TZ-KP-WS-409 archived; волна закрыта)  
> **Архив:** `tasks/_archive/2026-08/waves-done/WAVE-KP-SINGLE-WORKSPACE.md`  
> **Program:** `docs/audits/2026-08-23-kp-single-workspace-program.md`  
> **Executor prompt:** `tasks/PROMPT-FREEBUFF-KP-WORKSPACE-WAVE.md`  
> **Geometry law:** `docs/pages/kp-workspace-geometry.md`

## Цель волны

Заменить `/proposals/create` (god-page + dual flyouts) на **Single Workspace**: overlay tools, встроенные настройки документов, MCP-ready template drafts, multi-supplier UX — без регрессии autosave/build/PDF.

## Очередь TZ (строго по порядку)

| # | TZ | Сессия исполнителя | Суть |
|---|-----|-------------------|------|
| 0 | **TZ-KP-WS-400** | 1 (старт) | Аудит: IA, icons, store map, MCP, parity — **без product-кода** |
| 1 | **TZ-KP-WS-401** | 1 | `ProposalWorkspaceShellComponent` из demo; feature route |
| 2 | **TZ-KP-WS-402** | 2 | Store + chrome rails IA (L/R), icon dedup spec |
| 3 | **TZ-KP-WS-403** | 2 | Left: catalog + template + recipient (real components) |
| 4 | **TZ-KP-WS-404** | 3 | Right: params + table + terms + output |
| 5 | **TZ-KP-WS-405** | 3 | Embedded table/text/template settings (minimal navigate) |
| 6 | **TZ-KP-WS-406** | 4 | MCP/AI template draft entry + import-todo bridge |
| 7 | **TZ-KP-WS-407** | 4 | Multi-supplier: copy + org switch + template hint |
| 8 | **TZ-KP-WS-408** | 4 | Cutover `/proposals/create` + parity gates |
| 9 | **TZ-KP-WS-409** | 4 | Legacy strip + page docs + archive wave |

## Сессии (рекомендация PO)

Один агент = одна длинная сессия, `/clear` между сессиями:

1. **400 → 401** (~2–4 ч)
2. **402 → 403** (~4–8 ч)
3. **404 → 405** (~4–8 ч)
4. **406 → 409** (~4–8 ч)

## Conflict keys (общие)

```
frontend/src/app/pages/commercial/proposals/proposal-create.page.ts
frontend/src/app/pages/commercial/proposals/demo/proposal-workspace-demo.page.*
frontend/src/app/pages/commercial/proposals/**/proposal-workspace*
frontend/src/app/app.routes.ts
docs/pages/kp-workspace-geometry.md
docs/pages/proposals-create.page.md
```

Параллель с **DESK-425+**, **SHIP-433** — разные keys; при пересечении в `proposal-create.page.ts` → STOP.

## Gates (каждая TZ)

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="proposal-(create|workspace|product-rail)"
cd frontend && pnpm lint
```

Backend затронут только в 406+ (если `sourceFileRef`) — тогда + backend tsc/test.

## Deploy

Только по явной команде PO после **408 PASS** + smoke `docs/agent-checklists/KP-E2E-SMOKE.md`.
