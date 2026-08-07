═══════════════════════════════════════════════════════════════
TZD-17: MCP semantic domain layer (schema + validate + inbox audit)
═══════════════════════════════════════════════════════════════

> READY · LAYER 2 · desktop/mcp (+ опционально тонкий backend read, если без
> него нельзя отдать категории) · **не** параллелить с другим TZ на
> `desktop/mcp/src/inbox-tools.ts` / `write-tools.ts` / `tools.ts` без DEFER.
>
> Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`
> Audit trigger: PO + LM Studio MCP tools list (2026-08-08) — propose/confirm
> есть, semantic discovery / dry-run нет.
> Source of truth materials: `backend/src/modules/material/**`,
> `backend/src/modules/category/**`, `desktop/docs/MCP.md`, TZD-12…15 DONE.

STATUS: DONE — archive `tasks/_archive/2026-08/TZD-17.done.md`

РОЛЬ АГЕНТА: Desktop/MCP engineer (TypeScript, MCP SDK, Nest read-only client).

ЗАВИСИМОСТИ:
- TZD-12 (read tools) DONE
- TZD-13 (propose/confirm/undo) DONE
- TZD-15 (inbox list/propose_file) DONE
- Backend Material/Category API уже в main (не ждать новых write-эндпоинтов)

LAYER: 2

PAGES: (нет web UI) — только MCP tools + docs; Desktop App.svelte **не** обязателен
PAGE_DOCS: `desktop/docs/MCP.md` (обновить таблицы tools)

CONFLICT KEYS:
desktop/mcp/src/tools.ts;
desktop/mcp/src/read-tools.ts;
desktop/mcp/src/write-tools.ts;
desktop/mcp/src/inbox-tools.ts;
desktop/mcp/src/inbox.ts;
desktop/mcp/src/domain-schema.ts;
desktop/mcp/src/validate-material.ts;
desktop/mcp/src/domain-tools.ts;
desktop/mcp/src/*.test.ts;
desktop/docs/MCP.md;
docs/FEATURE-INTEGRATION-CHECKLIST.md;
docs/agent-checklists/TZD-17.md;

---

## Domain preflight

| Говорят | Канон в коде |
|---------|----------------|
| Материал | `Material` (`/api/materials`) |
| Категория материала | `Category` type=`material` (`/api/categories`) |
| Ед. изм. | поле `Material.unit` (string; UI default часто `шт`) — **не** отдельная сущность |
| SKU / внутренний код | `Material.sku`; при create без sku + category → backend `counter.next` + `category.skuPrefix` |
| Proposal / черновик | mutation-journal proposal (`material.create` / `material.update`) — **не** КП продаж |
| SoT | Mongo через Nest; MCP **не** пишет SoT без confirm (TZD-13) |

Проверено:
- `desktop/mcp/src/write-tools.ts` — propose create: name + optional unit/article/sku/categoryId; default unit `шт`
- `desktop/mcp/src/inbox-tools.ts` — `kppdf_inbox_list`, `kppdf_inbox_propose_file` (propose per row, no SoT)
- `backend/src/modules/material/material.service.ts` — category must be assignable; skuPrefix required for auto-sku
- `backend/src/modules/material/material.schema.ts` — `MATERIAL_KINDS = raw|part|fastener|purchased|other`
- `desktop/docs/MCP.md` — Orders/Production/Gantt out of scope

Кардинальность этого TZ: 1 MCP host → N tools; 1 inbox file → N row reports; validate **не** создаёт proposal.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. MCP client (Cursor / LM Studio) видит CRUD/propose tools, но **не** получает
   доменные правила: допустимые `materialKind`, как выбрать category, когда
   нужен `skuPrefix`, что считать дублем.
2. `kppdf_inbox_propose_file` сразу создаёт N proposals — нет режима
   «только разобрать + проверить» без journal.
3. Ошибки бизнес-правил всплывают поздно (на confirm / Material.create), агент
   учится методом тыка — дорого и грязно для ERP.
4. Нет read-tool списка категорий материалов с `skuPrefix` / active / type.

---

## ЧТО ДЕЛАТЬ (ровно 6 шагов)

### ШАГ 1 — Domain schema module (статический контракт)

Создать `desktop/mcp/src/domain-schema.ts` (имя файла можно уточнить, смысл фиксирован):

- Экспорт JSON-serializable объекта `KPPDF_MATERIAL_DOMAIN` (или функция
  `getMaterialDomainSchema()`):
  - required/optional fields для `material.create` proposal
  - `MATERIAL_KINDS` (скопировать канон из backend schema / задокументировать sync)
  - recommended units hint: как минимум `шт`, `м`, `м²`, `кг`, `л` (hint, не hard enum,
    если backend принимает произвольную string — явно написать в schema
    `"unitConstraint": "free-string-with-recommended"`)
  - rules text (RU+EN short): category type=material + active; auto-sku needs
    skuPrefix; name required; propose ≠ SoT write
- Unit-тест: schema содержит kinds + required `name`.

### ШАГ 2 — Tools: schema + categories

В новом `desktop/mcp/src/domain-tools.ts` (регистрация из `tools.ts`):

1. `kppdf_get_domain_schema`
   - input: optional `entity` enum default `material` (только `material` в этом TZ)
   - output: schema из шага 1 + version string (`tzd-17`)

2. `kppdf_list_categories`
   - `GET /api/categories` (или актуальный list-эндпоинт с query) с фильтром
     type=material если API поддерживает; иначе client-side filter
   - вернуть минимальные поля: `id`, `name`, `type`, `isActive`, `skuPrefix`
     (если поля нет в API — `skuPrefix: null` + note в docs)
   - pagination: page/limit по аналогии с `kppdf_list_materials`

Тесты: register names присутствуют; list_categories мокает backend GET.

### ШАГ 3 — Validate material (dry-run, без proposal)

`desktop/mcp/src/validate-material.ts` + tool `kppdf_validate_material`:

Input (как propose create): `name`, optional `unit`, `article`, `sku`, `categoryId`,
optional `materialKind`.

Логика (локально + read API, **без** POST proposals):

| Check | severity |
|-------|----------|
| name empty/whitespace | error |
| categoryId set but not found / not material / inactive | error |
| categoryId set, no sku, category without skuPrefix | error (mirror backend) |
| materialKind not in MATERIAL_KINDS | error |
| unit empty → note default `шт` | info |
| similar existing material by name/article (list_materials search) | warn |

Output shape (стабильный контракт):

```json
{
  "ok": false,
  "errors": [{ "code": "CATEGORY_INACTIVE", "message": "…" }],
  "warnings": [{ "code": "POSSIBLE_DUPLICATE", "message": "…", "materialId": "…" }],
  "infos": [{ "code": "UNIT_DEFAULT", "message": "unit → шт" }],
  "normalized": { "name": "…", "unit": "шт", "categoryId": "…" }
}
```

`ok === true` только если `errors.length === 0`.  
**Запрещено:** создавать proposal / писать SoT / вызывать confirm.

### ШАГ 4 — Inbox audit without propose

Расширить inbox MCP:

- Новый tool **`kppdf_inbox_audit_file`**
  - input: `fileName` (basename, path-traversal защита как в TZD-15)
  - parse через существующий `inbox.ts` pipeline
  - для каждой mappable строки вызвать ту же validate-логику (шаг 3);
    unmappable → skipped
  - output: `{ fileName, totalRows, mappable, skipped, errors, warnings, rows: [...] }`
  - **0** вызовов `/api/mutation-journal/proposals`

- Опционально (предпочтительно в этом же TZ): параметр
  `mode?: 'propose' | 'validate'` на `kppdf_inbox_propose_file`  
  где `validate` ≡ audit_file и **не** propose; default остаётся `propose`
  (обратная совместимость LM Studio / Cursor).  
  Если делаете только отдельный tool без mode — OK, но задокументировать.

Тесты: audit на fixture CSV → errors/warnings без mock POST journal.

### ШАГ 5 — Docs + Feature checklist

- `desktop/docs/MCP.md`: таблицы новых tools; явно:
  «validate/audit не пишут SoT и не создают proposal».
- `docs/FEATURE-INTEGRATION-CHECKLIST.md` §E — отметить новые tools.
- Rich descriptions у новых tools (1–3 предложения business rules в
  `description` MCP schema — агент читает их в tools/list).

### ШАГ 6 — Verification + smoke

- Unit/integration tests в `desktop/mcp`
- Live smoke (если backend+MCP up): tools/list содержит новые имена;
  `kppdf_get_domain_schema`; `kppdf_validate_material` с пустым name → ok:false;
  `kppdf_inbox_audit_file` на тестовый файл → нет новых proposals в journal

---

## ИЗМЕНЯТЬ

- `desktop/mcp/src/domain-schema.ts` (NEW)
- `desktop/mcp/src/validate-material.ts` (NEW)
- `desktop/mcp/src/domain-tools.ts` (NEW)
- `desktop/mcp/src/tools.ts` — register
- `desktop/mcp/src/inbox-tools.ts` / `inbox.ts` — audit tool (+ optional mode)
- `desktop/mcp/src/*.test.ts` — NEW/extend
- `desktop/docs/MCP.md`
- `docs/FEATURE-INTEGRATION-CHECKLIST.md` §E
- `docs/agent-checklists/TZD-17.md`

## НЕ ИЗМЕНЯТЬ

- Backend mutation-journal write semantics (propose/confirm/undo) — только READ
  categories/materials для validate
- Не добавлять silent SoT create/update tools
- Не трогать Orders / Production / Gantt / BOM graph (→ TZD-19)
- Не делать batch propose/confirm API (→ TZD-18)
- Не бандлить Node в MSI (pre-existing TZD-14)
- Не менять pairing TTL / auth model (отдельный ops TZ при необходимости)
- Не большой редизайн `desktop/src/App.svelte` (если хотите кнопку «Аудит» в UI —
  только тонкий вызов того же audit; иначе skip UI)
- Чужие TZ / `_templates/*` / `verify-status.sh`

---

## КРИТЕРИИ ПРИЁМКИ

1. `kppdf_get_domain_schema` возвращает kinds + required name + rules version `tzd-17`.
2. `kppdf_list_categories` возвращает material-категории с id/name/(skuPrefix|null).
3. `kppdf_validate_material`: пустой name → `ok:false` + error; **нет** POST proposals
   (тест со шпионом/mock).
4. `kppdf_validate_material`: несуществующий/неактивный categoryId → error.
5. `kppdf_inbox_audit_file` (или propose_file mode=validate): парсит файл, отдаёт
   per-row report, **0** journal proposals.
6. Существующий `kppdf_inbox_propose_file` (default) по-прежнему propose-only SoT-safe.
7. MCP.md + FEATURE-INTEGRATION-CHECKLIST §E обновлены.
8. Gates:

```text
cd desktop/mcp && pnpm typecheck
cd desktop/mcp && pnpm test
```

(если затронут desktop UI — ещё `cd desktop && pnpm typecheck` / `pnpm check`)

9. Checklist `docs/agent-checklists/TZD-17.md` + Executor report (auto) перед archive.
10. Archive: `tasks/_archive/2026-08/TZD-17.done.md` + lock по GEMINI.md / TZF-00
    после Cursor/PO PASS.

---

## known_limitation (successors)

| ID | Тема | Вне scope TZD-17 |
|----|------|------------------|
| **TZD-18** | Batch scale | `propose_batch` / `confirm_batch` / chunked inbox 1k–10k; idempotency |
| **TZD-19** | Graph + integrity | BOM/modules `where_used`, `run_integrity_suite`, stock consistency |
| ops | Pairing JWT TTL ~15m ломает длинные MCP-сессии | не tool-gap; отдельный auth/pairing TZ |
| | Hard unit enum в backend | если появится — sync schema; сейчас free-string + recommended |

---

## Промпт исполнителю (копировать)

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZD-17.md + checklist docs/agent-checklists/TZD-17.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт на desktop/mcp = STOP
5) Team Room claim best-effort

Затем: прочитай docs/AI-AGENT-GUIDE.md + tasks/_backlog/desktop/TZD-17-mcp-semantic-domain-layer.md
и выполни TZD-17 строго в рамках AC (schema + categories + validate + inbox audit).
Не делай TZD-18/19. Archive только после Cursor/PO PASS.
```

---

## Handoff для PO

Скопируй промпт выше агенту-исполнителю (Gemini/local). Доска: при старте —
строка в `docs/agent-checklists/_active-map.md` (Desktop MCP / TZD-17 CLAIMED).
