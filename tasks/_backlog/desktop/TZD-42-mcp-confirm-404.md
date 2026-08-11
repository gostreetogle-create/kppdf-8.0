═══════════════════════════════════════════════════════════════
TZD-42: MCP/journal — баг confirm 404 после propose
═══════════════════════════════════════════════════════════════

> Domain preflight: MutationJournal proposals; TTL 1h (`PROPOSAL_TTL_MS`).
> Симптом аудита: «Шест для лазания ШЛ-300» — propose OK → confirm 404
> (`docs/audits/2026-08-11-mcp-full-audit.md` §5.3). Не путать с expired
> (тот отдаёт 400, не 404).

РОЛЬ АГЕНТА: Desktop MCP + Backend mutation-journal (один агент, Layer 3 hot)

ЗАВИСИМОСТИ: Желательно после/параллельно с TZD-41 (envelope) — иначе 404
  маскируется неверным `proposalId` из nested JSON. Если стартуешь до 41 —
  в тестах явно передавай id из `proposal.id` / `proposal.proposalId` / top-level.

LAYER: 3

CONFLICT KEYS: backend/src/modules/mutation-journal/mutation-journal.service.ts; backend/src/modules/mutation-journal/mutation-journal.controller.ts; backend/src/modules/mutation-journal/mutation-journal.service.spec.ts; desktop/mcp/src/write-tools.ts; desktop/mcp/src/write-tools.test.ts; desktop/docs/MCP.md

PAGES: (нет)
PAGE_DOCS: (нет)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено:
- `mutation-journal.service.ts`: `confirm` → `loadOwned` → 404 если нет/чужой;
  expired → status expired + **BadRequestException** (не 404)
- TTL = 60 минут — мгновенный 404 после propose ≠ expiry
- MCP: `POST /api/mutation-journal/proposals/:id/confirm`
- Аудит: повторный propose+confirm с тем же именем сработал → похоже на
  **неверный id** или **гонку/удаление**, не на «продукт нельзя создать»

Гипотезы (проверить по приоритету):
1. Агент/клиент передал не тот id (envelope) — воспроизвести с wrong id → 404
2. `loadOwned` фильтр organization/user слишком жёсткий на pairing key
3. Proposal удаляется/перезаписывается batch-pathом или idempotency
4. Race: confirm до commit propose (маловероятно на HTTP, но замерить)

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Воспроизведение

  Под-шаг 1.1: Unit/integration: create proposal → immediate confirm (100× loop)
  Под-шаг 1.2: Confirm с заведомо битым id → ожидать 404 + понятное сообщение
  Под-шаг 1.3: Confirm чужим user/org → 404/403 (зафиксировать фактическое)
  Под-шаг 1.4: Если 1.1 зелёный на backend — воспроизвести через MCP tool chain
    с **явным** чтением proposalId из ответа (после TZD-41 — top-level)

ШАГ 2: Root cause + fix

  Под-шаг 2.1: Найти истинную причину 404 из аудита (логировать proposalId в toolFail)
  Под-шаг 2.2: Fix минимальный: либо journal ownership, либо MCP передача id,
    либо сообщение «proposal not found: <id>» + hint «скопируйте proposalId из propose»
  Под-шаг 2.3: Если баг только в агенте (неверный парсинг) — всё равно harden MCP:
    confirm description + fail text must echo received id

ШАГ 3: Регрессия

  - backend: `pnpm test -- mutation-journal`
  - desktop/mcp: propose→confirm product+material e2e-style unit с моком
  - Документ: MCP.md «Propose→confirm troubleshooting»

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: CONFLICT KEYS; checklist TZD-42

НЕ ИЗМЕНЯТЬ:
- Полный envelope rename (TZD-41) — только точечно, если блокер
- Production MCP (TZD-45)
- Массовую очистку демо-данных (TZD-44)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] Есть тест «100 propose→confirm подряд» без 404 (material или product)
- [ ] Root cause записан в checklist/archive (1 абзац: что было / что сделали)
- [ ] toolFail/HTTP на missing proposal включает proposalId в тексте
- [ ] `cd backend && pnpm test -- mutation-journal` PASS (или точный путь спеки)
- [ ] `cd desktop/mcp && pnpm test && pnpm exec tsc --noEmit` PASS
- [ ] Deploy НЕ

known_limitation: live replay «Шест для лазания» на проде необязателен, если
  unit+mcp chain закрывают гипотезы.

Финализация: `tasks/_archive/YYYY-MM/TZD-42.done.md`
