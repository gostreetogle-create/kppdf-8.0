# PROMPT — Freebuff · DOCSTUDIO-S0 (попытка №2): реестры «Тексты» и «Виды таблиц» + rich-text публично

Скопировать блок целиком. Кодовая волна в `frontend-nx`. Первый срез модуля №1.

> Попытка №1 остановилась после preflight, ничего не создав. Промпт усилен: явный claim,
> отчёт после каждого шага, запрет тихой остановки, и снята неоднозначность с git-зоной.

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main. Работать до конца волны,
не спрашивать «продолжать?» посередине.

ВАЖНО ПРО ЗОНУ: frontend-nx/ теперь в git (коммит 406a7952, 424 файла).
Это ТВОЯ рабочая зона, а не чужой WIP. Раньше она была untracked — если
предыдущая попытка приняла её за чужую, это была ошибка. Чужой WIP — только
backend/src/modules/unit/**, backend/src/modules/auth/**, backend/src/common/**
и застейдженные файлы tasks/** от параллельной docs-волны.

Контракт: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
        + .agents/skills/kppdf-context-preflight/SKILL.md
        + docs/PO-CANON.md + docs/PROJECT-MEMORY.md
Перед UI: docs/ui-rules.md + docs/DIALOG-COOKBOOK.md + docs/UX-FORM-CANON.md
Карта модуля (только читать, не править): docs/architecture/nx-doc-studio.md § 3, § 6

CLAIM первым (до любой правки) — все пять пунктов обязательны:
1) Get-Location + git rev-parse --show-toplevel → D:\kppdf-8.0
2) git fetch origin ; git merge origin/main ; git status --short
3) СОЗДАТЬ tasks/_active/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md (копия/маркер TZ) —
   предыдущая попытка этот файл не создала, без него claim недействителен
4) Обновить docs/agent-checklists/TZ-NX-DOCSTUDIO-S0.md (файл уже существует
   с прошлой попытки): Status CLAIMED, Claim slot agent_id: freebuff-docstudio-s0-r2,
   claimed_at ISO-8601, workspace D:\kppdf-8.0
5) Сверить docs/agent-checklists/_NOW.md и чужие tasks/_active/*. Параллельно
   идёт docs-волна TZ-NX-DOCPLAT-01 (владеет tasks/** и
   docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/**) — туда не писать.

ПРОТОКОЛ ПРОГРЕССА — тихо останавливаться ЗАПРЕЩЕНО:
после каждого шага 1–5 дописывай строку в ## Gates чеклиста (номер шага, что
сделано, какие файлы созданы). Не можешь выполнить шаг → запиши в чеклист
BLOCKED: <причина + путь>, поставь Status BLOCKED и скажи об этом явно.
Оставить «pending» и молча выйти — провал волны.

ЗАДАНИЕ: tasks/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md, шаги 1→5 по порядку.
В TZ выписаны точные поля схем, enum'ы и пути контроллеров — перепроверь их в
коде, но не переписывай «по памяти». Не совпало → в чеклист и следуй коду.

1) Публичный вход rich-text: создать
   frontend-nx/libs/ui/paper-and-ink/src/lib/rich-text/index.ts
   + alias "@kppdf/ui/rich-text" в frontend-nx/tsconfig.base.json
   (стиль как "@kppdf/ui/dialog": libs/.../dialog/index.ts).
   canvas/** НЕ открывать — его контракт задаётся в S2 под закон геометрии.

2) Сервисы data-access (только методы с потребителем в этом срезе):
   PiTextBlocksService, PiTextBlockCategoriesService, PiTableTemplatesService,
   PiRegistryDataSourcesService. Конвенция Pi*Service на silentGet/Post/Patch/
   Delete → SilentResult<T>, экспорт через public API libs/data-access.
   Без any, без придуманных полей.

3) Реестр «Тексты» (key text-blocks): source api, paginationMode client
   (GET /text-blocks отдаёт список целиком — фальшивую server-пагинацию НЕ
   изображать). Фильтры: поиск (клиент), categoryId и isActive (реальные query).
   Toolbar «Создать текст». Row actions icon-only: Редактировать, Архивировать
   (confirm до запроса). TextBlockFormDialogComponent: name, slug, tags,
   categoryId, sortOrder, content через @kppdf/ui/rich-text.
   Поле category НЕ отправлять никогда (backend вернёт 400 на
   forbidNonWhitelisted). columns[] — read-only сводка, сохранять без изменений.
   Перед edit-диалогом вызывать getById; ошибка → toast, диалог не открывать.

4) Реестр «Виды таблиц» (key table-templates): source api, paginationMode client.
   TableTemplateFormDialogComponent: name, description, category (6 значений
   product-spec | cost-calc | order-summary | price-list | custom | kp с
   RU-метками), sortOrder, dataSource (select из GET /registry/data-sources,
   можно оставить пустым), и редактор колонок: key*, label*,
   type (text|number|date|currency|bool), width, align (left|center|right),
   format? — добавить / удалить / переупорядочить строку.
   sampleRows НЕ затирать: отправлять только поля, которые форма меняет.

5) Зарегистрировать оба определения в registries.catalog.ts (станет 11 реестров),
   DestroyRef диалогов page-scoped как у остальных; обновить
   docs/pages/registries.page.md (таблица реестров + таблица filters/pagination
   + секция про новые диалоги + дата); написать spec'и: на каждый сервис, на
   каждое определение реестра, на редактор колонок, и на то, что category не
   уходит в payload текстового блока.

ЖЁСТКИЕ ЗАПРЕТЫ:
- backend/** и frontend/** — ни строки. Не хватает query-параметра →
  фильтруй на клиенте и пиши в known_limitation, API не менять.
- Не открывать публичный путь для canvas/**; не создавать роут /studio;
  не трогать оболочку, рельсы, меню, навигацию.
- Не добавлять any, raw HttpClient в компоненты, npm-зависимости, новые
  UI-примитивы в libs/ui кроме rich-text/index.ts.
- Не изображать server-пагинацию и не придумывать query-параметры.
- Не писать в docs/architecture/**, docs/adr/**, tasks/** кроме своего
  claim/archive. docs/pages/PAGE-TZ-INDEX.md — только строка в конец.
- git add только свои файлы поимённо. Не коммитить backend/src/modules/unit/**,
  backend/src/modules/auth/**, backend/src/common/** и застейдженные tasks/**
  от параллельной волны.
- Не деплоить, не трогать deploy/**, никакого wipe.

GATES (все зелёные до archive):
cd frontend-nx ; pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx ; pnpm test
cd frontend-nx ; pnpm lint
pnpm architecture:check
node start.mjs --nx --no-browser  → живой обход обоих реестров: создать,
  отредактировать, архивировать; 0 ошибок в консоли и сети; скриншоты в
  docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-S0/

ФИНАЛ: Integrity slot (docs/DOCS-INTEGRITY.md) → ## Executor report (auto)
(5 полей, полный 40-символьный SHA) → архив
tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S0-FOUNDATION.done.md + ARCHIVE_MARKER →
progress.md, _NOW.md, PAGE-TZ-INDEX.md, FIC §A →
commit/push своих файлов по docs/GIT-POLICY.md.
Отчёт: путь архива, что видно на /registries, число тестов, known_limitation.
```
