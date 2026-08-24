# TZ-AUDIT-MGR-530: manager-journey smoke + волны исправлений

PAGES: `/proposals/create` ; `/doc-constructor/builder/:id` ; `/desk` ; `/supply?view=quick` ; `/modules/:id`
PAGE_DOCS: kp-workspace.page.md ; kp-workspace-rail-ia.md ; builder.page.md ; manager-desk.page.md
РОЛЬ АГЕНТА: Cursor (docs + orchestration) · executor только при FAIL → thin TZ
ЗАВИСИМОСТИ: PO smoke wave 2026-08-24 (BIND-513…PAGE-520) — baseline после merge
LAYER: 0 (process) + docs
CONFLICT KEYS: `tasks/QUEUE-LIVE.md`; `docs/agent-checklists/KP-E2E-SMOKE.md`; `docs/PO-DIARY.md` §5

## Domain preflight

- **Проверено:** PO-CANON — «дожатая вертикаль», preview смотрит / не редактирует, reuse-first.
- **Проверено:** Organization = наша фирма; Counterparty = клиент/покупатель.
- **Не в scope:** deploy/wipe без явной команды PO; PDF attachments на модуль — отдельный backlog.

## Цель

Не ждать случайных находок PO — прогонять сценарии **менеджера** до «можно показать коллеге». Каждый FAIL → thin TZ → executor (≤2 Freebuff параллельно, разные conflict keys).

## Сценарии (smoke checklist)

Каждый пункт: **PASS** / **FAIL** + скрин/шаг при FAIL.

### 1. КП (commercial proposal)

| # | Шаг | Ожидание |
|---|-----|----------|
| 0 | Dev badge | Справа снизу `local · <git-sha>` — bundle свежий |
| 1.0 | Клиент → контакт/объект | `app-pi-select-add-row`: зелёный + **в одной строке** с overflow-select |
| 1.1 | Создать КП → выбать шаблон | Canvas/iframe загружается |
| 1.2 | Параметры → «Наша фирма» | `{{organization.name}}` в шапке заполнен |
| 1.3 | Клиент → контрагент + контакт + объект | `{{counterparty.*}}` в теле заполнены |
| 1.4 | Таблица → строки + итог | Суммы в preview/PDF |
| 1.5 | Условия → текст блока | Terms в preview; `{{kp_number}}` / dates |
| 1.6 | Preview / PDF | Подстановки не пустые; ориентация сохраняется после F5 |

**Refs:** `docs/agent-checklists/KP-E2E-SMOKE.md`; TZ-KP-BIND-513/514; TZ-KP-TPL-522; TZ-KP-TERMS-521; TZ-KP-PAGE-520; TZ-KP-PLUS-601R

### 2. Конструктор документов

| # | Шаг | Ожидание |
|---|-----|----------|
| 2.1 | Открыть шаблон в builder | Блоки на canvas |
| 2.2 | Правка text-block в `/doc-constructor/texts` → вернуться | Canvas обновился (live refresh) |
| 2.3 | Токены `{{organization.name}}` | Видны как chips в редакторе |
| 2.4 | Режим «Превью» в builder | `build()` — значения подставлены |
| 2.5 | Альбомная ориентация → сохранить → F5 | Ориентация сохранена |

**Refs:** TZ-DOC-524; TZ-DOC-525; TZ-DOC-ORIENT-523; data-field-picker TZ-KP-BIND-514

### 3. Стол менеджера (desk)

| # | Шаг | Ожидание |
|---|-----|----------|
| 3.1 | Открыть заказ → состав | Список модулей/материалов |
| 3.2 | Клик по строке модуля | Карточка view (`/modules/:id`), не edit modal |
| 3.3 | Карандаш на строке | Edit modal / composition edit |
| 3.4 | Блокнот у края app rail | Flyout `left: 3.5rem`, заголовок с номером заказа |
| 3.5 | Заметка → Изменить → Сохранить | PATCH текста; toggle «готово» работает |

**Refs:** TZ-DESK-433; TZ-DESK-434; TZ-DESK-435

### 4. Снабжение (supply)

| # | Шаг | Ожидание |
|---|-----|----------|
| 4.1 | Быстрый заказ → развернуть строку | **3 колонки A|B|C сразу** (без accordion «Поставщик/Детали») |
| 4.2 | Категории из API | Labels **RU** («Металлы», не `metals`); иерархия «Родитель › Лист» когда name-path |
| 4.3 | Выбор материала | Picker фильтруется; зелёный `+` в строке (`app-pi-select-add-row`) |
| 4.4 | Выбор поставщика (org) | Сайт + email **автозаполнены** из карточки |
| 4.5 | Выбор контакта | Тел + email менеджера автозаполнены; overflow-select (не native `<select>`) |
| 4.6 | `+` у org → «Из наших организаций» | Promote → org в списке + autofill cascade |
| 4.7 | Footer развёрнутой строки | Скопировать · Удалить · Сохранить; summary ~36px в свёрнутом |

**Refs:** TZ-SUPPLY-431 (DONE); TZ-CATALOG-376/377

### 5. Каталог / модуль

| # | Шаг | Ожидание |
|---|-----|----------|
| 5.1 | Модуль → фото upload JPG/PNG | Успех |
| 5.2 | Drop PDF на photo zone | «Только изображения…», без POST |
| 5.3 | Карточка модуля | Фото в галерее |

**Refs:** TZ-PHOTO-304

## Процесс оркестрации

1. **Preflight:** `docs/PO-CANON.md`; `_NOW.md`; `tasks/QUEUE-LIVE.md` — нет пересечения conflict keys.
2. **Smoke:** PO или Cursor+browser на живом стенде; чеклист выше.
3. **FAIL → TZ:** Cursor пишет `tasks/TZ-*.md` (thin, ≤7 шагов); при архитектурной неясности — MCP `claude_code` analysis-only **до** TZ.
4. **Executor:** Claim → code → gates → archive; ≤2 Freebuff параллельно если keys не пересекаются.
5. **После волны:** PO smoke повтор; PO-DIARY §5 — только новые инсайты taste/quality bar (не транскрипт).
6. **Queue:** обновить `tasks/QUEUE-LIVE.md` + `progress.md` строкой DONE/NEXT.

## Порядок волн (reference PO smoke 2026-08-24)

| Очередь | TZ | Приоритет |
|---------|-----|-----------|
| 1a | BIND-513 | P0 — подстановки КП |
| 1b | BIND-514 | P0 — picker clarity |
| 2a | DOC-525 | P0 — token chips |
| 2b | DOC-524 | P0 — live refresh |
| 3 | DESK-433+434+435 | P1 — стол |
| 4 | ORIENT-523 + PLUS-601R | P2 |
| 5 | TPL / TERMS / PAGE / CATALOG-376 / PHOTO-304 | polish |

Промпты: `tasks/PROMPT-FREEBUFF-*.md` по образцу IA-511.

## Критерии приёмки (этот TZ)

- [ ] Файл `tasks/TZ-AUDIT-MGR-530-manager-journey-audit.md` существует (этот документ)
- [ ] Строка в `docs/pages/PAGE-TZ-INDEX.md` (audit / cross-cutting)
- [ ] `tasks/QUEUE-LIVE.md` — секция «Audit MGR-530» или ссылка на чеклист
- [ ] PO может прогнать §Сценарии без дополнительных пояснений

## НЕ ИЗМЕНЯТЬ

- Product code в рамках этого TZ (docs-only orchestration)
- Plan file `po_smoke_fixes_wave_*.plan.md`
- Deploy/wipe без явной команды PO

## Verification

```text
# Docs-only — нет pnpm gates для product code
test -f tasks/TZ-AUDIT-MGR-530-manager-journey-audit.md
```
