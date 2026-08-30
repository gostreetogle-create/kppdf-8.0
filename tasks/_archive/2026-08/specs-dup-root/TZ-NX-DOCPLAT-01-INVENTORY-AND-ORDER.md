# TZ-NX-DOCPLAT-01: порядок в задачах + снять legacy-студию живьём

РОЛЬ АГЕНТА: executor (Freebuff), **docs/tasks-only + браузерная съёмка legacy**
ЗАВИСИМОСТИ: нет. Идёт параллельно с `TZ-NX-DOCSTUDIO-S0-FOUNDATION` (зоны не пересекаются)
LAYER: 0 (процесс/документация) + read-only проверка UI
PAGES: /doc-constructor/studio/:id ; /doc-constructor/builder/:id ; /proposals/workspace
PAGE_DOCS: document-studio.page.md ; builder.page.md ; kp-workspace.page.md

CONFLICT KEYS:
`tasks/**` (кроме `tasks/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md` и чужих `_active`) ; `docs/agent-checklists/TZ-NX-DOCPLAT-01.md` ; `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/**` ; `docs/agent-checklists/_NOW.md`

**НЕ трогать:** `frontend/**`, `frontend-nx/**`, `backend/**`, `docs/architecture/**`, `docs/adr/**`, `docs/pages/*.page.md`, `package.json`, `deploy/**`.

---

## ЦЕЛЬ

Две вещи, которые нужны до того, как волны по студии документов пойдут одна за другой.

1. **Убрать мусор из `tasks/`.** В корне 61 файл, из них 22 дублируют уже архивированные `.done.md`, при том что `tasks/README.md` прямо запрещает `TZ-*.md` в корне. Следующие волны в этом утонут.
2. **Снять legacy живьём.** PO переносит модуль документов и хочет видеть, что именно переносится. Три старых экрана (Studio, Builder, КП Workspace) существуют и работают — нужны скриншоты и честный список дефектов, а не пересказ документации.

Карта модуля уже написана: `docs/architecture/nx-doc-studio.md`. **Эту карту не переписывать и не дублировать** — она SoT, автор Cursor. Задача этой волны — порядок и доказательства, не анализ.

**Кода продукта не писать.** Дефекты — в список, не в патч.

## ИСХОДНОЕ СОСТОЯНИЕ (проверено)

- Дубли в корне `tasks/` (архив `.done.md` существует): `TZ-NX-B0-1-ui-public-api`, `TZ-NX-B0-2-library-lint-targets`, `TZ-NX-CATALOG-DATA-ACCESS-READ`, `TZ-NX-COMPOSITION-DOMAIN-REVIEW-CLOSEOUT`, `TZ-NX-COMPOSITION-NX-AUDIT`, `TZ-NX-CONSTRUCTOR-SHELL`, `TZ-NX-F1-foundation`, `TZ-NX-F2a-ui-primitives`, `TZ-NX-F3-data-access`, `TZ-NX-F4-kit-shell`, `TZ-NX-ORGANIZATION-REGISTRY-READ`, `TZ-NX-PASSPORT-SUPPLY-DECISIONS`, `TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ`, `TZ-NX-REGISTRIES-MASTER-TABLE-UX`, `TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS`, `TZ-NX-REGISTRIES-SUPPLY-PASSPORT-MATRIX`, `TZ-NX-REGISTRY-READINESS-MARATHON`, `TZ-NX-REGISTRY-UNITS-DISCOVERY`, `TZ-NX-SHELL-CANON`, `TZ-NX-SHELL-kit-dev-link`, `TZ-NX-SUPPLY-REQUEST-REGISTRY-READ`, `TZ-OPS-NX-start-fast-path`.
- `tasks/README.md` §«Файлы в корне» разрешает только `README.md`, `QUEUE-LIVE.md`, `PROMPT-RESUME-ANY.md`, `PROMPT-FOLLOW-QUEUE.md`, `PROMPT-UNIVERSAL-CONTINUOUS.md`, `PROMPT-DEPLOY-READY.md`. Строка «Сейчас (2026-08-23)» устарела.
- Legacy-роуты: `/doc-constructor/studio` и `/studio/:id`, `/doc-constructor/templates`, `/doc-constructor/builder/:id`, `/doc-constructor/texts`, `/doc-constructor/tables`, `/proposals/workspace` (`frontend/src/app/app.routes.ts:479-481` и рядом).
- Известные дыры legacy (проверить, а не переписать): в Studio панель свойств показывает геометрию только для чтения (`studio-panel-properties.component.ts:92-119`) и нет тулбара шрифтов (`:29-37`); в Builder страница зажата на 1 (`docs/pages/builder.page.md:68-69`); КП Workspace за геометрией уводит в Builder через `returnUrl`.

## ЧТО ДЕЛАТЬ

### Фаза A — порядок в `tasks/`

1. Для каждого из 22 дублей сравнить корневой файл с `tasks/_archive/2026-08/<X>.done.md`. Архив полный (`ARCHIVE_MARKER` / `Executor report`) и корень не несёт нового текста → `git rm tasks/<X>.md`. Корень несёт уникальный текст → `git mv` в `tasks/_archive/2026-08/specs-dup-root/<X>.md` + строка в `## Outcome` чеклиста, что именно уникально.
2. Прочие корневые `TZ-*.md` (не дубли, не выданные сейчас) → `tasks/_backlog/<тема>/` + строка в `tasks/_backlog/QUEUE.md`. Темы: `nx`, `doc-studio`, `ux-hygiene`, `ops`. Папка `tasks/_backlog/nx/` уже существует — не создавать дубль.
3. Отработанные `PROMPT-*.md` → `tasks/_archive/2026-08/prompts-spent/`.
4. **Оставить в корне** 6 служебных файлов из `README.md` + активные файлы текущих волн: `TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.md`, `TZ-NX-DOCSTUDIO-S0-FOUNDATION.md`, `PROMPT-FREEBUFF-DOCPLAT-01.md`, `PROMPT-FREEBUFF-DOCSTUDIO-S0.md`, `PROMPT-CLAUDE-DOCSTUDIO-REVIEW.md`.
5. Обновить `tasks/README.md`: актуальная секция «Сейчас», ссылка на `docs/architecture/nx-doc-studio.md` как на карту модуля №1.
6. Ничего не удалять в `_archive/**`, `_park/**`, `docs/`.

### Фаза B — снять legacy живьём

1. Поднять legacy: `node start.mjs --no-browser` (порт и вход — по `docs/how-to-connect-ai.md`; учётные данные **не записывать** в файлы и не коммитить).
2. Скриншоты в `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/`, минимум по одному на пункт:
   - `/doc-constructor/templates` — список шаблонов;
   - `/doc-constructor/builder/:id` — панель страницы (размер, ориентация, поля), палитра вставки, блок в состоянии drag;
   - `/doc-constructor/studio` — список документов, «Из шаблона»;
   - `/doc-constructor/studio/:id` — каждый рельс: Элементы, Слои, Шаблон, Данные, Свойства, Таблица; добавление и удаление страницы; диалог save-as-template;
   - `/proposals/workspace` — превью, таблица позиций, наследование контрагента; **и то же в альбомной ориентации**;
   - `/doc-constructor/texts` и `/doc-constructor/tables` — библиотеки текстов и видов таблиц.
3. Отдельно проверить и снять **закон геометрии** на КП Workspace в обеих ориентациях: ширина панели 480px, зазор листа справа ≈8px, прямоугольник листа идентичен при открытой и закрытой панели (Δ ≤ 0.5px). Метод и чек-лист — `docs/pages/kp-workspace-geometry.md` § Чек-лист. Числа замерять из браузера, а не оценивать на глаз.
4. По каждому экрану строка в `## Gates` чеклиста: работает / работает частично / падает, с ошибками консоли и сети.
5. Дефекты и мёртвые кнопки — списком в `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/defects.md`: экран, шаги, ожидание, факт, файл-подозреваемый. Одна строка = заготовка будущей TZ. **Не патчить.**

## ИЗМЕНЯТЬ

`tasks/**` (перемещения по фазе A), `tasks/README.md`, `tasks/_backlog/QUEUE.md`, `docs/agent-checklists/TZ-NX-DOCPLAT-01.md`, `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/**`, `docs/agent-checklists/_NOW.md` (своя секция), одна строка в конец `docs/pages/PAGE-TZ-INDEX.md`.

## НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ

1. Ни строки в `frontend/**`, `frontend-nx/**`, `backend/**` — даже «очевидный фикс». Дефект → `defects.md`.
2. Не писать в `docs/architecture/**` и `docs/adr/**`: карта модуля и ADR — зона Cursor и ревьюера.
3. Не трогать `tasks/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md` и файлы чужого `_active` — параллельно идёт кодовая волна S0.
4. Не создавать сущности, поля, endpoints, права. Не менять схемы, не запускать миграции, не импортировать XLSX, не писать в Mongo.
5. Не начинать реализацию студии в NX.
6. Не проектировать склад и не предлагать другие модули переноса (`docs/PO-CANON.md` п.7).
7. Не деплоить, не трогать `deploy/**`, никакого wipe.
8. Не коммитить чужой WIP: `backend/src/modules/unit/**`, `backend/src/modules/auth/**`, `backend/src/common/**` — `git add` только свои файлы поимённо.
9. `docs/pages/PAGE-TZ-INDEX.md` — только дописать строку в конец, ничего не переупорядочивать (файл правит и параллельная волна).

## КРИТЕРИИ ПРИЁМКИ

1. В корне `tasks/` — 6 служебных файлов + 5 файлов текущих волн, перечисленных в фазе A.4. Ни один `.done.md` в `_archive/**` не изменён и не удалён.
2. `tasks/README.md` и `tasks/_backlog/QUEUE.md` соответствуют фактическому содержимому папок.
3. `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/` содержит ≥12 скриншотов по списку фазы B.2, включая альбомную ориентацию КП.
4. Замеры геометрии из фазы B.3 приведены числами (ширина панели, зазор, Δ листа) для книжной и альбомной ориентации.
5. `## Gates` содержит строку по каждому экрану из B.2; каждый «частично» и «падает» имеет строку в `defects.md`.
6. `defects.md` не содержит пунктов без шагов воспроизведения.
7. Integrity slot заполнен (`docs/DOCS-INTEGRITY.md`); `## Executor report (auto)` — 5 полей, полный 40-символьный SHA.
8. Код продукта не менялся → в `## Gates` зафиксировать `docs-only: typecheck/tests/lint N/A` + доказательство запуска legacy-приложения.

```text
git status --short
node start.mjs --no-browser
```

## known_limitation

- Дефекты из `defects.md` не исправляются: каждый станет отдельной TZ по решению PO.
- Браузерная проверка 9 реестров NX остаётся в park — по реестрам уже заказана отдельная TZ `tasks/_backlog/nx/TZ-NX-REGISTRY-CRUD-UNIFY.md`.

## Финализация

`tasks/_archive/2026-08/TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.done.md` по `GEMINI.md` + `ARCHIVE_MARKER`, строка в `progress.md`, своя секция в `docs/agent-checklists/_NOW.md`, строка в конец `docs/pages/PAGE-TZ-INDEX.md`.
