# TZ-NX-DEALS-D4-CONTRACTS-THIN: договоры list+card

**SIZE:** S
**РОЛЬ:** Executor (frontend-nx; BE `modules/contract` готов)
**LAYER:** 2
**PAGES:** contracts
**PACK:** WAVE-NX-DEALS D4
**PAGE_DOCS:** `docs/pages/contracts.page.md`
**ЗАВИСИМОСТИ:** D1 TOC slot — done; D2 не блокер
**CONFLICT KEYS:** `app.routes.ts`; `pages/contracts/**`; `libs/data-access/.../pi-contracts.service.ts` (+ types); D1 chrome activeId; IMPLICIT `nx build kppdf-web`

## ЧТО СДЕЛАНО

1. `PiContractsService`: **list/get только** (read-only) — `CreateContractDto` требует `organizationId`+`customerId`+`items[]` заранее, не thin-form fit; sign/attach/activate — отдельный юр.workflow (multipart file upload), явно исключённый TZ.
2. Pages: `/contracts` list (Номер · Заказчик · Статус · Сумма · Карточка) + `/contracts/:id` thin card (номер, статус banner, Заказчик, КП через `proposalId.number`, позиции, сумма).
3. Подключено к D1 TOC — chip «Договоры» разблокирован (`disabled: true` убран из `DEALS_TOC_CHIPS`, был reserved-id заглушкой с D1).
4. Specs (8 новых: list 4 + detail 4) + `docs/pages/contracts.page.md` — новая секция «NX thin CRUD (D4, read-only)» с явным known_limitation, заменяет устаревшую пометку «successor / PARK».

## НЕ (соблюдено)

BE не переписывался; PDF editor / полный юр.workflow / `/desk` — не строились.

## AC — результат

1. ✅ `/contracts` список из API; TOC кликабелен.
2. ✅ Карточка открывается.
3. ✅ `nx build kppdf-web` PASS.

## Gates (факт)

```
pnpm exec nx test data-access --testPathPattern=pi-contracts → PASS (3/3)
pnpm exec nx test kppdf-web --testPathPattern="contract" → PASS (79 suites, 490 passed, 0 failed; 8 новых)
pnpm exec nx lint kppdf-web / data-access → 1 self-introduced warning найден/убран (unused RouterLink) → 0 в touched files
pnpm exec nx build kppdf-web → PASS, exit 0
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: PASS (data-access + kppdf-web focused specs, 11 new tests total)
  - lint: PASS (0 errors/warnings in touched files after self-fix)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DEALS-D4-CONTRACTS-THIN.md)
  - progress.md: N/A (captured in checklist + page.md per token-budget policy)
  - status synchronization: PASS
