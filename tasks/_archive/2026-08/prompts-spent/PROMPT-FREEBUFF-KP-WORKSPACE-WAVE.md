# PROMPT — Freebuff: KP Single Workspace (полная волна)

> **Один агент · одна сессия = один блок ниже.** Между блоками `/clear`.  
> **Geometry law:** `docs/pages/kp-workspace-geometry.md` — нарушение = STOP.  
> **Program:** `docs/audits/2026-08-23-kp-single-workspace-program.md`

---

## CLAIM (каждая сессия, до кода)

```text
1) Get-Location; git rev-parse → D:\kppdf-8.0
2) tasks/_active/<TASK-ID>.md + docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at ISO + workspace
4) tasks/_active-map + чужие keys → конфликт = STOP
5) Team Room claim best-effort
6) docs/AI-AGENT-GUIDE.md + GEMINI.md + назначенные TZ
```

---

## Сессия 1 — аудит + shell (400 → 401)

**Порядок:** `TZ-KP-WS-400` **полностью** → archive → `TZ-KP-WS-401` → archive.

400: **только docs**, прочитать `proposal-create.page.ts` и subcomponents, выход `docs/audits/2026-08-23-kp-workspace-implementation-audit.md` + `docs/pages/kp-workspace-rail-ia.md`.

401: вынести `ProposalWorkspaceShellComponent`, demo = wrapper, route `/proposals/workspace`. **Не трогать** `/proposals/create`.

Gates после 401:
```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test -- proposal-workspace && pnpm lint
```

PO checkpoint: `/proposals/demo-workspace` geometry PASS.

---

## Сессия 2 — store + левые панели (402 → 403)

**Порядок:** `402` → archive → `403` → archive.

402: `ProposalWorkspaceStore` + chrome rails L/R по `kp-workspace-rail-ia.md`, dedup icons.

403: подключить **реальные** product rail, template picker, recipient, template center, autosave на `/proposals/workspace?id=`.

Gates:
```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test -- "proposal-(workspace|product-rail|template|recipient)" && pnpm lint
```

PO checkpoint: добавить изделие, F5, сменить шаблон — на workspace route.

---

## Сессия 3 — правые панели + inline settings (404 → 405)

**Порядок:** `404` → archive → `405` → archive.

404: params, table editor (tier-L overlay), terms, output — parity create.

405: inline table preset dialog, text block editor, template background upload; PiDialog/Sheet only.

Gates:
```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test -- "proposal-(workspace|create-table|create-inspector|create-terms)" && pnpm lint
```

PO checkpoint: редактировать таблицу, условия, PDF gate, inline preset.

---

## Сессия 4 — MCP, supplier, cutover, cleanup (406 → 409)

**Порядок:** `406` → `407` → `408` → `409` — каждый archive перед следующим.

406: MCP draft + BE fields + workspace CTA + pairing hint.

407: org hint, copy for other firm, family attach.

408: **cutover** `/proposals/create` → workspace; KP-E2E-SMOKE evidence.

409: delete legacy shell, `kp-workspace.page.md`, wave DONE.

Gates финал:
```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test -- proposal && pnpm lint
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test -- document-template
pnpm architecture:check
```

Deploy: **НЕ** без команды PO.

---

## Запреты

- Reflow/shrink A4 on panel open (any orientation)
- Второй write-path Quotation
- Hand-rolled modals
- Skip TZ-400 before 401
- Cutover 408 before 403–407 PASS
- Закрыть TZ без обновления `docs/pages/kp-workspace.page.md` (если менялись route/секции/API/data-test)

---

## Если застрял

Architecture smell → STOP, note in Team Room, не патчить вслепую.
