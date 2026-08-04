═══════════════════════════════════════════════════════════════
TZ-CATALOG-306 — Полный аудит и доведение каталога до единого UX
═══════════════════════════════════════════════════════════════

> **СТАТУС:** DRAFT / DISCUSSION ONLY — код не изменять до отдельного согласования PO.
> **АВТОР:** GPT — независимый архитектурный аудит.
> **ДАТА:** 2026-08-04.
> **ОСНОВА:** текущие Product / ProductModule / Material / WorkType страницы,
> маршруты, сервисы и backend-контракты; канон `tasks/TZ-CATALOG-300.md`.
> **СВЯЗЬ:** это аудит и планирование поверх CATALOG-300/301; не заменяет
> их и не запускает CATALOG-302+.

РОЛЬ АГЕНТА: Senior Product/UX + Backend Architect (audit mode)
LAYER: 1 — audit/specification
ЗАВИСИМОСТИ: peer-review PO и актуальное состояние CATALOG-301
CONFLICT KEYS: только этот файл и новые audit/checklist-файлы;
не редактировать backend/src/** или frontend/src/** в рамках этого TZ.

═══════════════════════════════════════════════════════════════
0. ЦЕЛЬ И ГРАНИЦЫ
═══════════════════════════════════════════════════════════════

Проверить каталог как будто он впервые передан новому архитектору:

- `/products` и `/products/:id`;
- `/modules` и `/modules/:id`;
- `/materials` (и будущий `/materials/:id`);
- `/work-types`;
- общую навигацию «Каталог», UI-kit, формы и таблицы;
- связи с категориями, цветами, фотографиями, документами и складом;
- соответствие backend schema → DTO → service → controller → frontend service;
- legacy-состав (`productModuleIds[]`, `ProductModule.materials[]`) против
  будущего `composition[]` из CATALOG-300;
- доступы, валидацию, soft-delete, историю и обратные ссылки.

НЕ входит в этот аудит: web Excel-import, desktop-import Wave 4, BOM write,
заказы/производство/Gantt, массовая новая бизнес-логика, немотивированный
рефакторинг UI-kit и выполнение CATALOG-302+.

Принцип: сначала доказать фактическую проблему по коду, затем создать
отдельную child-TZ. Не превращать аудит в разрешение переписать весь каталог.

═══════════════════════════════════════════════════════════════
1. ФАКТИЧЕСКИЕ НАБЛЮДЕНИЯ (на 2026-08-04)
═══════════════════════════════════════════════════════════════

### P0 — не оставлять до запуска composition-wave

**P0.1. Канон состава и текущий код расходятся.**

CATALOG-300 фиксирует `composition[]`, смешанные Product/Module связи,
qty, sortOrder, duplicate/cycle/depth guards и постепенное удаление legacy.
Текущий код по факту всё ещё использует:

- `Product.productModuleIds[]` без quantity;
- `ProductModule.materials[]` без `module`/`product` child-line;
- `ProductModuleService.findAll(productId)` делает reverse lookup через
  Product;
- Product detail и catalog UI показывают только legacy modules/materials.

Вывод: это не дефект, который нужно чинить в audit-only TZ; это подтверждает,
что CATALOG-302 → 305 должны быть выполнены строго последовательно.
Запрещено делать отдельные UI-«деревья» поверх legacy, пока не определён
read-adapter для composition.

**P0.2. Удаление legacy-связей опасно для истории.**

Каталог участвует в КП/заказах/себестоимости и исторические сущности должны
оставаться неизменяемыми. Любая migration/cleanup обязана иметь dry-run,
idempotency, orphan report, rollback/backup strategy и dual-read window.
Hard-delete каталоговых узлов, на которые ссылаются snapshots/история,
запрещён. Это отдельные AC CATALOG-304/ARCHIVE successor, не quick fix.

### P1 — обязательные дочерние задачи

**P1.1. Нет полноценной detail-страницы материала.**

Есть `/materials`, форма и ссылки на склад, но единый deep-link `/materials/:id`
и карточка материала по паттерну product/module detail в текущем роутинге не
зафиксированы. Без неё цепочка Product → Module → Material заканчивается
текстом в строке/диалоге. Добавить отдельную MaterialDetailPage с обратными
ссылками, но только после определения API `where-used`.

**P1.2. Нет единого обратного графа «где используется».**

Нужны безопасные read-only связи:

- Product → modules / products / materials (после composition);
- Module → parent products / child modules / materials / work types;
- Material → modules / products / stock items;
- WorkType → modules.

Не считать `populate` полноценным where-used API. Результат должен быть
пагинированным, role-scoped и tolerant к orphan rows.

**P1.3. ProductModuleService и Product API всё ещё завязаны на legacy.**

Нужно явно определить adapter/contract version, чтобы старый UI и новый
composition UI не отправляли несовместимые payloads. После CATALOG-304 write
source — только composition; legacy доступен read-fallback на переходный срок.

**P1.4. Состав модуля и состав продукта отображаются несимметрично.**

Product показывает expandable modules и showcase grid; Module detail показывает
materials/work types. Но нет общего composition tree/editor, единых line-level
количества, sort order, type badges, links и lazy-loading policy. Нужен один
переиспользуемый CompositionTree/CompositionLineEditor после стабилизации API.

**P1.5. Фото реализованы неравномерно.**

Material и Product имеют photoIds/main photo-паттерн, Module использует отдельную
ProductModulePhoto entity. В форме модуля сейчас есть URL-добавление/заглушка,
а в других местах upload UX отличается. Нужен единый PhotoGallery/PhotoEditor
контракт: upload, preview, main, reorder, remove, orphan cleanup, alt/caption,
loading/error/empty и unsaved-cancel behavior.

**P1.6. Документы и паспорта не представлены как единый каталоговый контур.**

У Product есть boolean-поля hasPassport/hasDrawing, но audit должен подтвердить,
где реально лежат документы и как они связаны с Product/Module/Material.
Не добавлять ещё boolean-флаги без проверки существующих document entities.
Нужен typed attachment contract с entityType/entityId, access policy и audit.

**P1.7. Удаление/видимость должны быть единообразными.**

В коде встречаются soft-delete через `deletedAt`, но ModuleService.remove()
делает hard delete. До исправления нужно подтвердить все модели и middleware.
Нельзя удалять материал/модуль, если он участвует в исторических snapshots или
в действующем составе; UI должен показывать «архивировать», а не разрушительное
«удалить» там, где это запрещено.

**P1.8. Доступы и scope нужно проверить по endpoint.**

Catalog list/detail/write сейчас используют разные `@Roles` в местах; audit
должен проверить read для user, write для manager/admin и organization/system
scope. Нельзя считать наличие route guard доказательством backend authorization.

### P2 — UX/качество, после P0/P1

**P2.1. Навигация и терминология.**

Оставить технические API-имена Product/ProductModule, но в UI использовать
«Продукция/Изделие», «Модули», «Материалы», «Виды работ». Добавить breadcrumbs,
«назад к родителю», links на карточки и сохранение query/filter state только
после проверки router contract.

**P2.2. Единый dialog contract.**

Все формы должны использовать один PiDialog/PiFormField pattern, одинаковые
max-width, sticky footer, dirty-close confirmation, double-submit guard,
inline API error, loading/error/empty states и keyboard focus/ESC behavior.
Не переписывать рабочие диалоги ради косметики: зафиксировать матрицу отклонений
и чинить только подтверждённые расхождения.

**P2.3. Единый table/list contract.**

Общие search/sort/page/loading/empty/error/action patterns; row actions не
должны срабатывать при клике по links, switches или expansion. Уточнить
server/client pagination для Modules и WorkTypes — сейчас они возвращают flat
arrays и режутся на frontend, в отличие от Products/Materials.

**P2.4. Удобство мобильного экрана и accessibility.**

Проверить 375px, keyboard focus, visible focus, labels, dialog scroll lock,
aria-expanded/aria-controls для expansion, image alt и contrast. Это manual/e2e
acceptance, не повод расширять backend scope.

═══════════════════════════════════════════════════════════════
2. ОБЯЗАТЕЛЬНЫЕ РЕЗУЛЬТАТЫ АУДИТА
═══════════════════════════════════════════════════════════════

Исполнитель этого audit-TZ не пишет product-код. Он должен создать:

1. inventory-таблицу: route → page → service → backend endpoint → role;
2. relation matrix: parent → child → quantity/order → link → where-used;
3. schema/DTO/controller mismatch table;
4. photo/document/stock integration matrix;
5. UI-kit/dialog/table deviation matrix;
6. prioritized findings P0/P1/P2 с file:line evidence;
7. recommended child-TZ list, dependency graph and explicit out-of-scope;
8. manual smoke script for the four catalog areas.

Файлы результата:

- `docs/audits/2026-08-04-catalog-coherence-audit.md` — canonical findings;
- `docs/agent-checklists/TZ-CATALOG-306.md` — gates + Executor report;
- `tasks/_archive/2026-08/TZ-CATALOG-306-catalog-coherence-audit.done.md` —
  только после проверки и закрытия audit.

Исходный `tasks/TZ-CATALOG-306...md` удалить из `tasks/` только после archive
marker и согласования PO. До этого он остаётся активным draft.

═══════════════════════════════════════════════════════════════
3. РЕКОМЕНДУЕМЫЙ ПОРЯДОК CHILD-TZ
═══════════════════════════════════════════════════════════════

Не запускать всё параллельно: CATALOG-301 уже конфликтует с этой зоной.

1. `CATALOG-301` — закрыть Mongo E2E, проверить diff и архивировать.
2. `CATALOG-302` — composition contract: schema/DTO/endpoints, Product + Module;
   не UI.
3. `CATALOG-303` — mixed graph guards: cycle/depth/legacy bypass tests.
4. `CATALOG-304` — idempotent legacy migration + dual-read + legacy write lock.
5. `CATALOG-305` — Product→Product, derived complex and product picker/API.
6. `CATALOG-306-A` — read-only where-used/backlinks (after composition API).
7. `CATALOG-306-B` — unified composition tree/editor (after read API stable).
8. `CATALOG-306-C` — MaterialDetailPage + unified catalog detail shell.
9. `CATALOG-306-D` — photo/document/attachment integration.
10. `CATALOG-306-E` — archive/delete/authorization consistency.
11. `CATALOG-306-F` — UI polish/accessibility/manual browser regression.

A child is allowed to change only its declared conflict keys and must include
regression tests and a checklist. No agent may create duplicate CATALOG IDs.

═══════════════════════════════════════════════════════════════
4. ACCEPTANCE CRITERIA ДЛЯ ОБСУЖДАЕМОГО MASTER-ТЗ
═══════════════════════════════════════════════════════════════

1. Это audit/spec, не реализация; кодовые файлы не изменяются.
2. Все findings имеют evidence path/line либо помечены как hypothesis to verify.
3. Legacy composition и CATALOG-300 остаются явным P0 dependency, не обходятся UI.
4. MaterialDetailPage и where-used не стартуют до стабилизации composition read API.
5. Фото/документы/stock не получают новые сущности без inventory существующих.
6. Soft-delete, history, org-scope и role scope проверяются по backend, не только FE.
7. Каждый child-TZ имеет узкий scope, AC, conflict keys и собственный archive.
8. `tasks/` очищается после DONE: checklist → Executor report → archive marker →
   lock/STATUS/progress → удаление активного TZ-файла.

═══════════════════════════════════════════════════════════════
5. KNOWN LIMITATIONS
═══════════════════════════════════════════════════════════════

- Этот файл не доказывает отсутствие дефектов: точные file:line findings должны
  быть подтверждены исполнителем audit в canonical audit report.
- CATALOG-301 в текущем worktree имеет незакрытый Mongo E2E blocker; пока он
  BLOCKED, CATALOG-302 не начинать.
- Текущая ветка содержит параллельные dirty-файлы CATALOG-301 и docs-подготовки;
  аудит не должен их перезаписывать, коммитить или архивировать за исполнителя.
- Photo URL в ModuleDetail и boolean passport/drawing — observed surfaces;
  точный backend/document contract должен быть проверен перед child-TZ.

═══════════════════════════════════════════════════════════════
6. КОРОТКИЙ ПРОМПТ АУДИТ-ИСПОЛНИТЕЛЮ
═══════════════════════════════════════════════════════════════

Прочитай `GEMINI.md`, `docs/AI-AGENT-GUIDE.md`, `docs/TZ-AUTHORING.md`,
`tasks/TZ-CATALOG-300.md` и этот файл. Работай только в audit/spec scope.
Создай checklist до первой правки, затем read-only проинвентаризируй реальные
routes/pages/services/controllers/schemas/tests. Не исправляй код и не трогай
dirty-файлы CATALOG-301. В каждый finding добавь path:line или пометь hypothesis.
Создай `docs/audits/2026-08-04-catalog-coherence-audit.md`, relation/integration
матрицы, dependency graph и manual smoke. После peer-review и gates добавь
Executor report, архивируй только согласованный audit-TZ; push/commit только
по отдельной команде PO.
