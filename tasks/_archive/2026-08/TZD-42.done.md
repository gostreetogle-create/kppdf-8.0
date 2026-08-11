═══════════════════════════════════════════════════════════════
TZD-42: MCP/journal — баг confirm 404 после propose
═══════════════════════════════════════════════════════════════

> Источник: tasks/_backlog/desktop/TZD-42-mcp-confirm-404.md
> Аудит: docs/audits/2026-08-11-mcp-full-audit.md §5.3
> («Шест для лазания ШЛ-300»: propose OK → confirm 404)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-11T23:55:00Z
closed_by: Buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (backend mutation-journal 26/26; desktop/mcp 115/115)
  - lint: N/A (нет lint-скрипта в desktop/mcp; backend lint не затронут — только spec)
  - checklist: ADDED (docs/agent-checklists/TZD-42.md)
  - progress.md: UPDATED
  - status synchronization: PASS

═══════════════════════════════════════════════════════════════
ROOT CAUSE (1 абзац)
═══════════════════════════════════════════════════════════════

**404 в аудите был следствием неверного парсинга proposalId (TZD-41),
а НЕ гонкой/потерей в журнале.** Journal sound: `proposed`-записи не
удаляются нигде (`enforceRing` чистит только `applied|undone`, `cancel` →
status cancelled, TTL expiry → 400 BadRequest, а не 404); ownership-проверка
даёт 403 Forbidden (не 404); единственный источник 404 — невалидный/не
найденный ObjectId. В аудите `propose_product_create` возвращал
`{ ok, proposal: { proposalId } }`, парсер агента не нашёл id и confirm ушёл
с мусорным id → `Types.ObjectId.isValid` false → 404. TZD-41 закрыл парсинг
(top-level `proposalId`); TZD-42 зафиксировал это тестами и захарденил MCP
(эхо id в fail + описание + troubleshooting в MCP.md).

═══════════════════════════════════════════════════════════════
ЧТО СДЕЛАНО
═══════════════════════════════════════════════════════════════

ШАГ 1 — Воспроизведение (backend `mutation-journal.service.spec.ts`)
- **100× propose→confirm подряд без 404** (material.create, свежие docs
  в in-memory store, 100/100 applied) — гипотеза race/потеря отвергнута.
- confirm с невалидным id → 404 + id в сообщении.
- confirm отсутствующего валидного id → 404 + id в сообщении.
- confirm чужим пользователем (non-admin) → 403 Forbidden (НЕ 404).
- confirm admin чужой организации → 403 Forbidden (НЕ 404).
- double-confirm (уже applied) → 400 (НЕ 404) — ретрай не путать с 404.

ШАГ 2 — Fix/harden MCP (`desktop/mcp/src/write-tools.ts`)
- `kppdf_confirm_proposal` / `kppdf_cancel_proposal`: toolFail эхо-тит
  полученный `proposalId=…` + hint «копируйте proposalId из propose-ответа».
- description confirm_proposal дополнен troubleshooting-подсказкой.

ШАГ 3 — Регрессия
- desktop/mcp `write-tools.test.ts`: e2e-цепочка propose → top-level
  proposalId → confirm с тем же id (0 угадываний, URL проверен);
  confirm-fail эхо-тит id.
- backend: `pnpm test -- mutation-journal` → 26/26 PASS (было 21, +5).
- desktop/mcp: `pnpm test` → 115/115 PASS; `tsc --noEmit` PASS.
- MCP.md: раздел «Propose→confirm troubleshooting (TZD-42)».

КРИТЕРИИ ПРИЁМКИ
- [x] Тест «100 propose→confirm подряд» без 404 (material)
- [x] Root cause записан (1 абзац выше)
- [x] toolFail на missing proposal включает proposalId в тексте
- [x] `cd backend && pnpm test -- mutation-journal` PASS (26/26)
- [x] `cd desktop/mcp && pnpm test && pnpm exec tsc --noEmit` PASS
- [x] Deploy НЕ

known_limitation:
- Live replay «Шест для лазания» на проде не выполнялся (работа в worktree;
  live MCP крутит старую версию) — покрыто unit + MCP chain-тестами.
- Backend product-code не менялся (бага в журнале не было); только spec.
