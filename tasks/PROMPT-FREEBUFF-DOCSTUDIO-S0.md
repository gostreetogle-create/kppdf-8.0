# PROMPT — Freebuff #1 · DOCSTUDIO-S0: реестры «Тексты» и «Виды таблиц» + rich-text публично

Скопировать блок целиком. Кодовая волна в `frontend-nx`. Первый срез модуля №1.

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main. Работать до конца волны,
не спрашивать «продолжать?» посередине.

Контракт: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
        + .agents/skills/kppdf-context-preflight/SKILL.md
        + docs/PO-CANON.md + docs/PROJECT-MEMORY.md
Перед UI: docs/ui-rules.md + docs/DIALOG-COOKBOOK.md + docs/UX-FORM-CANON.md
Карта модуля (только читать, не править): docs/architecture/nx-doc-studio.md § 3, § 6

CLAIM первым (до любой правки):
1) Get-Location + git rev-parse --show-toplevel → D:\kppdf-8.0
2) git fetch origin ; git merge origin/main ; git status --short
3) tasks/_active/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md + чеклист
   docs/agent-checklists/TZ-NX-DOCSTUDIO-S0.md по _TEMPLATE.md
4) Status CLAIMED; Claim slot: agent_id: freebuff-docstudio-s0,
   claimed_at ISO-8601, workspace D:\kppdf-8.0
5) Сверить docs/agent-checklists/_NOW.md и чужие tasks/_active/*.
   Параллельно идёт docs-волна TZ-NX-DOCPLAT-01 (она владеет tasks/** и
   docs/agent-checklists/**) — туда не писать, кроме своего чеклиста.

ЗАДАНИЕ: tasks/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md, шаги 1→5 по порядку.
В TZ уже выписаны точные поля схем, enum'ы и пути контроллеров — перепроверь их
в коде, но не переписывай «по памяти». Не совпало → пиши в чеклист и следуй коду.

1) Публичный вход rich-text: создать
   libs/ui/paper-and-ink/src/lib/rich-text/index.ts + alias "@kppdf/ui/rich-text"
   в frontend-nx/tsconfig.base.json (стиль как "@kppdf/ui/dialog").
   canvas/** НЕ открывать — его потребитель появится в S2.

2) Сервисы data-access (только методы с потребителем в этом срезе):
   PiTextBlocksService, PiTextBlockCategoriesService, PiTableTemplatesService,
   PiRegistryDataSourcesService. Конвенция Pi*Service на silentGet/Post/Patch/
   Delete → SilentResult<T>. Без any, без придуманных полей.

3) Реестр «Тексты» (key text-blocks): source api, paginationMode client
   (GET /text-blocks отдаёт список целиком — фальшивую server-пагинацию НЕ
   изображать). Фильтры: поиск (клиент), categoryId и isActive (реальные query).
   Toolbar «Создать текст». Row actions: Редактировать, Архивировать (confirm).
   TextBlockFormDialogComponent: name, slug, tags, categoryId, sortOrder,
   content через @kppdf/ui/rich-text. Поле category НЕ отправлять никогда
   (backend вернёт 400). columns[] — read-only сводка, сохранять без изменений.

4) Реестр «Виды таблиц» (key table-templates): source api, paginationMode client.
   TableTemplateFormDialogComponent: name, description, category (6 значений:
   product-spec | cost-calc | order-summary | price-list | custom | kp с RU-метками),
   sortOrder, dataSource (select из GET /registry/data-sources, можно пусто),
   и редактор колонок: key*, label*, type (text|number|date|currency|bool),
   width, align (left|center|right), format? — добавить/удалить/переупорядочить.
   sampleRows НЕ затирать: отправлять только поля, которые форма меняет.

5) Зарегистрировать оба в registries.catalog.ts (станет 11 реестров),
   обновить docs/pages/registries.page.md (таблица реестров + таблица
   filters/pagination + секция про новые диалоги + дата), написать spec'и:
   на каждый сервис, на каждое определение реестра, на редактор колонок и на
   то, что category не уходит в payload текстового блока.

ЖЁСТКИЕ ЗАПРЕТЫ:
- backend/** и frontend/** — ни строки. Не хватает query-параметра →
  фильтруй на клиенте и пиши в known_limitation, API не менять.
- Не открывать публичный путь для canvas/**; не создавать роут /studio;
  не трогать оболочку, рельсы, меню, навигацию.
- Не добавлять any, raw HttpClient в компоненты, npm-зависимости, новые
  UI-примитивы в libs/ui кроме rich-text/index.ts.
- Не изображать server-пагинацию и не придумывать query-параметры.
- Не писать в docs/architecture/**, docs/adr/**, tasks/** (кроме claim/archive).
- docs/pages/PAGE-TZ-INDEX.md — только дописать строку в конец.
- Не коммитить чужой WIP: backend/src/modules/unit/**,
  backend/src/modules/auth/**, backend/src/common/** — git add поимённо.
- Не деплоить, не трогать deploy/**, никакого wipe.

GATES (все зелёные до archive):
cd frontend-nx ; pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx ; pnpm test
cd frontend-nx ; pnpm lint
pnpm architecture:check
node start.mjs --nx --no-browser   → живой обход обоих реестров: создать,
  отредактировать, скопировать поведение полей, архивировать; 0 ошибок в
  консоли и сети; скриншоты в docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-S0/

ФИНАЛ: Integrity slot (docs/DOCS-INTEGRITY.md) → ## Executor report (auto)
(5 полей, полный 40-символьный SHA) → архив
tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S0-FOUNDATION.done.md + ARCHIVE_MARKER →
progress.md, _NOW.md, PAGE-TZ-INDEX.md, FIC §A →
commit/push своих файлов по docs/GIT-POLICY.md.
Отчёт: путь архива, что видно на /registries, число тестов, known_limitation.
```
