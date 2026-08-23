# KP Single Workspace — программа (2026-08-23)

> **Север:** одно место для создания и редактирования КП — без прыжков в «Документы» за таблицами, текстами, шаблоном, справкой.  
> **Эталон геометрии:** `docs/pages/kp-workspace-geometry.md` · **Wave 0 PASS:** `/proposals/demo-workspace`  
> **Исполнение:** `tasks/WAVE-KP-SINGLE-WORKSPACE.md` · промпт: `tasks/PROMPT-FREEBUFF-KP-WORKSPACE-WAVE.md`

## Цель PO (зафиксировано)

1. **Single workspace** — коммерческое предложение целиком на одной странице: каталог, шаблон, получатель, параметры, состав/таблица, условия, вывод, справка.
2. **Настройки рядом** — пресеты таблиц, текстовые блоки, фон/страницы шаблона открываются **из workspace**, не обязательный уход в `/doc-constructor/*`.
3. **Multi-supplier** — то же КП для разных **наших фирм** (`Organization`): копия + смена поставщика → другой шаблон/реквизиты; семейство вариантов сохраняется.
4. **AI/MCP-ready** — в перспективе агент создаёт шаблон из PDF/рисунка/таблицы через Desktop MCP; архитектура не должна блокировать это на Wave 1–3.
5. **Wave 0 layout** — визуальный каркас принят; **внутренности** (кнопки, фильтры, пагинация, подсказки) проектируются заново по аудиту, не копируются с dummy слепо.

## Текущее состояние (факты)

| Зона | Сегодня | Проблема |
|------|---------|----------|
| Create KP | `/proposals/create` · `proposal-create.page.ts` (~2600 LOC) | God-page; L+R flyouts; часть настроек только через navigate |
| Demo shell | `/proposals/demo-workspace` | Геометрия OK; placeholders |
| Admin settings | `/doc-constructor/{templates,builder,texts,tables}` | SoT shared presets; оператор вынужден «лазить» |
| MCP | `desktop/mcp` → Nest REST | Пустые `[AI-DRAFT]` шаблоны; **нет** parse PDF/image→blocks |
| FE↔MCP | Нет прямой связи | Pairing в header; `/import-todos` для HITL |

## Слои наложения (после аудита TZ-KP-WS-400)

```text
Layer 0  Geometry shell (demo → shared component)     TZ-401
Layer 1  Store + rail IA (icons, L/R map)             TZ-402
Layer 2  Left tools (catalog · template · recipient)  TZ-403
Layer 3  Right tools (params · table · terms · output) TZ-404
Layer 4  Embedded doc settings (inline presets/text)  TZ-405
Layer 5  MCP/AI template draft entry                  TZ-406
Layer 6  Multi-supplier copy/variant UX              TZ-407
Layer 7  Cutover + parity tests                      TZ-408
Layer 8  Legacy cleanup + page docs                   TZ-409
```

**Закон:** Layer N+1 не стартует без PASS предыдущего + gates из AC.

## IA: старые flyout → новый workspace

| Было (create) | Секция workspace | Rail | Ширина панели |
|---------------|------------------|------|---------------|
| Шаблон | Каталог шаблонов + «Редактировать» | Left (chrome) | 480 overlay |
| Товары | Каталог изделий/модулей/материалов | Left | 480 |
| Получатель | Клиент · контакт · объект | Left | 480 |
| Параметры | Документ · деньги · сроки · org | **Right** (новый chrome-rail-right или panel mode) | 480 |
| Редактор таблицы | Состав + chrome таблицы | Right | wide (~A4) или full overlay tier-L |
| Условия | Terms + библиотека TextBlock | Right | 480 |
| Вывод | Печать · PDF · Архив | Ribbon + compact right | action, не reflow |

**Ribbon:** ориентация листа, №/дата, статус/сумма, печать/PDF — **действия**, не дубли rail.

**Dummy sections → prod map:** demo `catalog|template|composition|params|client|terms` переименовать/слить по таблице выше в TZ-402.

## MCP / AI template-from-file (MVP arch)

| Слой | Сейчас | Wave 406 | STATUS |
|------|--------|----------|--------|
| MCP | `kppdf_doc_template_create_draft` (пустой shell) | + `sourceFileRef`, auto todo href в workspace | ✅ DONE (TZ-406) |
| BE | DocumentTemplate без меток источника | + `sourceFileRef` + `draftSource` (migration-safe, null default) | ✅ DONE (TZ-406) |
| Workspace UI | — | секция «Из файла (AI)»: pairing CTA + badge /import-todos + `?templateDraft=` открывает панель «Шаблон» | ✅ DONE (TZ-406) |
| Desktop | PDF import stub | не блокер Wave 406; successor TZ | не менялся |

**TZ-406 (2026-08-23):** `kppdf_doc_template_create_draft` принимает опциональный
`sourceFileRef` и сам создаёт import-todo с `href /proposals/workspace?templateDraft=<id>`
(отдельный `kppdf_import_todo_create` не нужен). Парсинг PDF/vision — **отдельная
successor-волна** после embedded builder (405); контент файла не конвертируется
в блоки автоматически (known_limitation).

## Multi-supplier (бизнес)

- `organizationId` на `Quotation` = **наша фирма** (поставщик в КП).
- Смена org **не** авто-меняет шаблон (сегодня); Wave 407: подсказка + быстрый pick шаблона org-scope + «Копировать для другой фирмы».
- Family attach (`TZ-SALES-313`) — reuse, не второй write-path.

## Обязательный аудит до кода (TZ-400)

1. Карта ownership: document vs template vs org vs line snapshot.
2. Единый контракт `kpTableLayout` / `sheetLayout` / `terms` (FE↔BE↔build).
3. Матрица иконок/кнопок: dedup, Lucide, aria RU.
4. Parity checklist: каждая функция create → workspace.
5. MCP readiness + gap list для template-from-file.
6. Conflict keys + порядок миграции файлов.

## Антипаттерны

- Сжимать/двигать A4 при open panel (см. geometry law).
- Второй write-path на Quotation.
- Новые hand-rolled overlays вместо shell + Pi primitives.
- Cutover без parity Jest + KP-E2E-SMOKE.
- Standalone preview как доказательство PASS.

## Ссылки

- `docs/pages/kp-workspace.page.md` — **SoT страницы** (обновлять в каждой TZ волны)
- `docs/pages/proposals-create.page.md` — frozen create canon (до cutover)
- `docs/ux/kp-create-studio-spec.md` — FROZEN UX (supersede только через PO + audit)
- `docs/agent-checklists/KP-E2E-SMOKE.md`
- `desktop/docs/MCP.md`
