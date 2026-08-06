# План: Desktop, MCP, интеграции, PDF и AI-ассистент KPPDF

> **Тип документа:** PLAN / DRAFT FOR REVIEW
> **Статус:** СОХРАНЁН ДЛЯ ОБСУЖДЕНИЯ · НЕ УТВЕРЖДЁН · НЕ К ИСПОЛНЕНИЮ
> **Правило:** этот файл не является техническим заданием и не даёт агенту разрешения менять код, создавать `_active`-claims, архивировать задачи, коммитить или деплоить.

## Как использовать этот план

При следующем запросе PO «выполнить все технические задачи из плана» агент обязан **не начинать кодирование автоматически**. Сначала он должен:

1. заново прочитать этот план и проверить актуальный `origin/main`;
2. провести свежий аудит кода, backlog, архивов, активных claims и зависимостей;
3. сравнить план с текущей бизнес-логикой и уже выполненными TZ;
4. найти устаревшие, дублирующие или опасные пункты;
5. предложить исправленную редакцию очереди, границ и критериев приёмки;
6. задать PO короткий список вопросов только по действительно неоднозначным решениям;
7. **ждать явного подтверждения обновлённого плана**;
8. только после подтверждения оформить отдельные executable TZ в `tasks/_backlog/` или `tasks/`, выполнить их строго по одной и пройти обычный CLAIM → gates → review → archive flow.

Фразы «выполнить план», «заняться планом» или «поехали» без подтверждения пересмотренной редакции **не считаются утверждением плана**. До подтверждения разрешены только read-only аудит, предложения и правки **только этого plan-документа**; executable TZ, `_active`-claims, код и иные проектные документы создавать/менять/коммитить нельзя. Каноническая фраза разрешения: **«Утверждаю обновлённый план; создавай TZ»**.

## Цель

Подготовить безопасный и расширяемый контур, в котором менеджер сможет:

- подключить KPPDF Desktop;
- разговаривать с AI на русском языке;
- искать и читать данные KPPDF через MCP;
- загружать данные из файлов пачками;
- получать preview, ошибки и предложения изменений;
- подтверждать изменения осознанно;
- формировать документы и получать стабильный PDF;
- позже использовать внешние сервисы: ИНН/контрагенты, календарь, курсы валют, доставка и ЭДО.

## Зафиксированные архитектурные принципы для пересмотра

1. **Backend остаётся Source of Truth.** Desktop, MCP и AI не получают прямой доступ к MongoDB.
2. **RBAC проверяется backend.** MCP не обходит роли, permissions, organization scope и audit.
3. **Записи не происходят молча.** Для AI/MCP write-flow используется `proposal → confirm → mutation journal → undo`, если доменный контракт допускает undo.
4. **Внешние API вызываются только через backend adapters.** Ключи не попадают во frontend, desktop UI или промпты.
5. **Preview до массовой записи.** Batch import показывает сопоставление, ошибки, дубли и предполагаемые изменения до подтверждения.
6. **Локальные и Synology-данные различаются.** Внешние справочники и seed не считаются автоматически синхронизированными между окружениями.
7. **PDF на выходе и PDF на входе — разные потоки.** Их нельзя объединять в одну большую TZ.
8. **EDO и доставка — отдельные доменные контуры.** Они не должны появиться внутри базового MCP/import/PDF scope без подтверждения бизнес-процесса.

## Текущая база, от которой отталкиваемся

По состоянию аудита:

- Desktop/Tauri и pairing уже существуют;
- MCP host и локальный socket реализованы;
- MCP read tools покрывают часть материалов, продукции и склада;
- propose/confirm/undo и mutation journal реализованы для части material write-flow;
- inbox для `xlsx/csv/tsv/txt` реализован как proposal-flow;
- `desktop/src/core/pipeline.ts` остаётся неполной заготовкой;
- `desktop/src/importers/pdf.ts` остаётся заглушкой;
- Node runtime пока не бандлится в установщик;
- реальная установка Windows и end-to-end MCP smoke требуют отдельной проверки;
- backend уже содержит контрагента, организацию, ИНН-валидацию, документы и generated-document контур, но перед новой интеграцией нужно перепроверить живые API и SoT.

## Предлагаемая очередь и зависимости

Очередь является **предварительной**. Номера ниже — плановые идентификаторы, не claims и не executable TZ.

```text
P1  Desktop installer/runtime readiness
    ↓
P2  MCP read contract v2
    ↓
P3  External integration boundary
    ↓
P4  Counterparty/Organization lookup by INN
    ↓
P5  Desktop batch import + AI normalization
    ↓
P6  Reliable PDF output contract
    ↓
P7  KPPDF AI assistant orchestration
    ├── P8  PDF import/extraction
    └── P9  Local Russian production calendar

Later branches:
P10 EDO provider contract
P11 Shipment/carrier adapters
```

Параллельность разрешается только после нового аудита conflict keys. В частности, P1/P2/P5 имеют общую desktop/MCP область и не должны автоматически запускаться одновременно.

---

## P1 — Desktop installer/runtime readiness

**Предварительное имя:** `TZD-PLAN-17`
**Назначение:** довести desktop до реального пользовательского запуска.

Проверить и спроектировать:

- Tauri icons и возможность `pnpm tauri build`;
- `.exe`/`.msi` артефакты без коммита бинарников;
- публикацию установщика в `/downloads/`;
- поведение на чистой Windows-машине;
- Node/MCP runtime: bundled sidecar либо явная проверка prerequisites;
- pairing → сохранение конфигурации → MCP `healthz` → `kppdf_ping`;
- обновление `desktop/docs/PAIRING.md`, `desktop/docs/MCP.md`, `desktop/README.md`.

**Не входит:** auto-update, macOS/Linux packaging, production deploy без отдельного разрешения.

**Критерий готовности будущей TZ:** менеджер скачивает, устанавливает и запускает приложение по документированному сценарию.

## P2 — MCP read contract v2

**Предварительное имя:** `TZD-PLAN-18`
**Зависимость:** P1 или подтверждённый dev fallback.

Добавить после проверки существующих backend endpoints:

- Counterparty и Organization;
- Product и ProductModule;
- composition tree;
- WorkType;
- Order и Contract;
- generated documents;
- storage movements;
- поиск, фильтры, pagination и русские описания tools.

**Ограничения:** только backend API, тот же JWT/RBAC/org scope, без прямого Mongo-доступа, без write-flow.

## P3 — External integration boundary

**Предварительное имя:** `TZ-INT-PLAN-301`
**Зависимость:** нет; но executable TZ создавать только после повторной проверки backend patterns.

Спроектировать общий backend adapter contract для внешних провайдеров:

- config/env без секретов в репозитории;
- feature flag;
- timeout;
- retry только для безопасных GET;
- rate limit;
- cache;
- masked error logging;
- health/status;
- fake provider для тестов;
- единый mapping внешних ошибок.

Это не означает немедленное подключение всех внешних API.

## P4 — Контрагент/организация по ИНН

**Предварительное имя:** `TZ-INT-PLAN-302`
**Зависимость:** P3.

Первый кандидат — DaData через backend adapter, с возможностью позднее добавить ФНС/ГАР.

Сценарий:

1. менеджер вводит ИНН или название;
2. backend получает варианты;
3. UI показывает preview;
4. пользователь подтверждает выбор;
5. форма заполняется;
6. сохранение выполняется обычным KPPDF API;
7. дубликат по ИНН явно показывается;
8. при недоступности провайдера остаётся ручной ввод.

Ключи только на backend. Автоматическое создание записи без подтверждения запрещено.

Перед TZ нужно заново подтвердить различие `Counterparty` и `Organization`, уникальность ИНН и актуальные DTO.

## P5 — Desktop batch import + AI normalization

**Предварительное имя:** `TZD-PLAN-19`
**Зависимости:** P1, P2; P4 желательно для контрагентов.

Поток:

```text
CSV/XLSX/TXT → parse → entity selection → AI normalization → schema validation
→ duplicate check → preview → corrections → proposal → confirm → batch apply
→ per-row report
```

Первая очередь сущностей:

1. Material;
2. Counterparty;
3. Organization;
4. Product;
5. ProductModule;
6. WorkType.

Обязательны preview, `created/updated/skipped/failed`, ошибки по строкам, дедупликация, per-row idempotency, безопасный повтор и proposal/confirm.

## P6 — Надёжный PDF output

**Предварительное имя:** `TZ-DOC-PLAN-301`
**Зависимость:** уточнить актуальный generated-document/template pipeline.

Цепочка:

```text
DocumentTemplate → document data → HTML/layout snapshot → PDF renderer
→ GeneratedDocument → download
```

Проверить и закрепить:

- кириллицу и шрифты;
- таблицы;
- изображения;
- переносы страниц;
- колонтитулы и нумерацию;
- повторяемость результата;
- хранение версии/snapshot;
- скачивание и error state;
- Jest/integration/browser smoke.

`window.print()` может быть вспомогательным действием, но не единственным серверным PDF-контрактом.

## P7 — KPPDF AI assistant orchestration

**Предварительное имя:** `TZD-PLAN-20`
**Зависимости:** P2, P5, P6, P4.

AI должен:

- понимать русскую команду;
- определять сущность и намерение;
- использовать read tools;
- задавать уточнения;
- показывать preview;
- переводить write в proposal;
- ждать подтверждения;
- возвращать audit/report;
- уважать RBAC и organization scope.

Примеры: поиск материалов, создание контрагента по ИНН, импорт Excel, состав продукта, формирование документа и выдача PDF.

Не делать «универсальный агент с правом на всё» и не давать AI прямой доступ к БД.

## P8 — PDF import/extraction

**Предварительное имя:** `TZD-PLAN-21`
**Зависимость:** P5; P7 желательно.

Отдельный поток для входящих PDF:

- извлечение текста;
- таблицы;
- preview страниц;
- OCR для сканов;
- AI normalization;
- строковая валидация;
- proposal до записи.

Сначала текстовые PDF, OCR и сложные таблицы — отдельный successor scope.

## P9 — Local Russian production calendar

**Предварительное имя:** `TZ-INT-PLAN-303`
**Зависимость:** не блокирует основной MCP-поток.

Локальные функции `isWorkingDay` и `addWorkingDays`, официально проверяемые данные по годам, тесты переносов и подключение к будущему planning/Gantt. Runtime не должен зависеть от внешнего календарного API.

## Later — EDO и доставка

### P10 — EDO provider contract

Оставить отдельным плановым направлением для юридически значимого контура: Диадок/Saby, УПД, акты, ЭТРН, КЭП и статусы обмена. Не входит в базовый менеджерский MCP MVP.

### P11 — Shipment/carrier adapters

Оставить отдельным направлением после подтверждения `Shipment`-процесса: СДЭК, Почта России и другие перевозчики. Не привязывать произвольно к `Order`, если SoT доставки отдельный.

## Что нужно создать только после утверждения плана

Пока **не создавать** executable TZ, `tasks/_active/*`, claims или locks для пунктов P1–P11.

После отдельного PO-подтверждения каждый пункт оформляется отдельной задачей по `docs/TZ-AUTHORING.md`:

- `ROLE`, `DEPENDENCIES`, `LAYER`, `CONFLICT KEYS`;
- `PAGES` и `PAGE_DOCS`, если есть UI;
- факты с реальными путями и схемами;
- `ИЗМЕНЯТЬ` / `НЕ ИЗМЕНЯТЬ`;
- measurable acceptance criteria;
- pnpm gates;
- known limitations;
- CLAIM/handoff block;
- правила archive только после gates и Executor report.

## Повторный review gate

Перед превращением любого пункта в TZ агент обязан проверить:

- не закрыт ли он уже существующим archive;
- не изменился ли backend/API после текущего `origin/main`;
- не занят ли conflict key другим агентом;
- не противоречит ли он текущему `data-model`, RBAC и PDF/document канону;
- не требует ли он PO-решения по необратимой бизнес-логике;
- не является ли пункт слишком большим и требующим split.

**Только после этого PO подтверждает обновлённый план.**

## Источники текущего плана

- `desktop/README.md`
- `desktop/docs/MCP.md`
- `desktop/docs/PAIRING.md`
- `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`
- `docs/TZ-AUTHORING.md`
- `docs/FEATURE-INTEGRATION-CHECKLIST.md`
- `docs/pages/README.md`
- `tasks/_backlog/desktop/`
- `tasks/_backlog/TZ-DOC-330-doc-from-order-data.md`
- `tasks/_backlog/TZ-SHIPPING-301-shipping-board-doc-attach.md`

## PO decision

- [ ] План пересмотрен после свежего аудита
- [ ] Порядок P1–P11 подтверждён
- [ ] Границы P10/P11 подтверждены как later
- [ ] Можно создавать executable TZ для выбранного пункта

> **Последнее правило:** наличие этого файла означает наличие обсуждаемого roadmap, а не разрешение на реализацию. Любой новый запуск начинается с review и заканчивается явным подтверждением PO обновлённого плана.
