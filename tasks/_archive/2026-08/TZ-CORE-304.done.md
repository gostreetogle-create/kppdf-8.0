═══════════════════════════════════════════════════════════════
TZ-CORE-304: запушить leftover CORE-302 (deletedAt)
═══════════════════════════════════════════════════════════════

> docs/TZ-AUTHORING.md. Покупатель = Counterparty ≠ Organization.

РОЛЬ АГЕНТА: Backend Developer
ЗАВИСИМОСТИ: TZ-CORE-302 archive говорит DONE, но Group B не была на origin.
  CORE-303 починил только `@Schema` у 17 файлов. На диске оставались
  незакоммиченные `deletedAt` в ~44 schema.ts + spec.
LAYER: 4
PAGES: N/A
PAGE_DOCS: N/A

CONFLICT KEYS: 44 `*.schema.ts` (см. исходный TZ) + `backend/src/database/soft-delete-coverage.spec.ts`

## ЧТО СДЕЛАНО

- Landed все 44 `*.schema.ts` из CONFLICT KEYS + `soft-delete-coverage.spec.ts`
  (был untracked) — `deletedAt?: Date | null` (`@Prop({ type: Date, default: null, index: true })`)
  на каждую коллекцию.
- Найден и исправлен дефект того же класса, что TZ предупредила про
  `ContractItem`: полный скан всех 44 файлов на `_id: false` subdoc-классы
  нашёл 7 файлов с такими subdoc'ами. `bom`/`storage-item` уже были верны;
  **5 файлов** (`contract`, `document-table-type`, `purchase-order`,
  `purchase-request`, `tech-process`) имели `deletedAt` только на вложенном
  `_id: false` line-item subdoc, не на самой коллекции. Перенёс поле с
  subdoc на родительский коллекционный класс во всех пяти — `deletedAt` на
  subdoc без своего `_id` бессмысленен для soft-delete запроса.
- Коммит против origin — чистый ADD только на коллекциях; промежуточное
  неверное состояние (deletedAt на subdoc) никогда не попадало в git-историю.
- Стейджил строго CONFLICT KEYS через `git add --` с явным списком (не
  `git add -A`).

## Acceptance (из TZ)

- [x] KEYS на origin (commit `c4322e4b`)
- [x] `soft-delete-coverage.spec.ts` PASS
- [x] backend tsc PASS
- [x] `git status` без `M` на этих schema после push

## Gates (факт)

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit                          → exit 0
cd backend && pnpm exec jest src/database/soft-delete-coverage.spec.ts --runInBand   → 1/1 PASS
```

## known_limitation

Ничего не отложено — все CONFLICT KEYS landed, subdoc-дефект найден и
исправлен во всех затронутых файлах (не только явно названном в TZ
`ContractItem`).

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude
sha: c4322e4b
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (soft-delete-coverage 1/1)
  - lint: N/A (не запрашивался в TZ)
  - checklist: ADDED (`docs/agent-checklists/TZ-CORE-304.md`)
  - progress.md: N/A
  - status synchronization: PASS (`_NOW.md`)
