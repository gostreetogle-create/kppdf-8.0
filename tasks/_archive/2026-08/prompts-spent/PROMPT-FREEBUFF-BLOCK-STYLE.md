# PROMPT — Freebuff · дельта D1: типографика блока доживает до PDF (backend only)

Скопировать блок целиком. Backend-волна, идёт **параллельно** с волной реестров (зоны не пересекаются).

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main. Работать до конца волны,
не спрашивать «продолжать?» посередине.

Контракт: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
        + .agents/skills/kppdf-context-preflight/SKILL.md
        + docs/PO-CANON.md + docs/PROJECT-MEMORY.md
Карта модуля (только читать, не править): docs/architecture/nx-doc-studio.md § 4 (дельта D1)

CLAIM первым (до любой правки), все пункты обязательны:
1) Get-Location + git rev-parse --show-toplevel → D:\kppdf-8.0
2) git fetch origin ; git merge origin/main ; git status --short
3) СОЗДАТЬ tasks/_active/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE.md
4) СОЗДАТЬ docs/agent-checklists/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE.md по
   _TEMPLATE.md; Status CLAIMED; Claim slot agent_id: freebuff-block-style,
   claimed_at ISO-8601, workspace D:\kppdf-8.0
5) Сверить _NOW.md и чужие tasks/_active/*. Параллельно идёт волна
   TZ-NX-REGISTRY-CRUD-UNIFY (владеет frontend-nx/**) — туда не писать ни строки.

ВНИМАНИЕ, ЧУЖОЙ WIP В РАБОЧЕЙ КОПИИ: в backend лежат незакоммиченные правки
чужой волны по авторизации — backend/src/common/contracts/rbac-contract.ts,
backend/src/common/guards/permissions.guard.ts, backend/src/modules/auth/**,
backend/src/modules/unit/**. Их НЕ трогать, НЕ откатывать и НЕ коммитить.
git add строго поимённо по своим файлам.

ЗАДАНИЕ: tasks/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE.md, шаги 1→5 по порядку.
Это подготовка среза S4: схема и рендер сейчас, UI-тулбар позже. Если сделать
наоборот, сохранённый текст придётся переписывать миграцией.

ГЛАВНОЕ ПРАВИЛО ВОЛНЫ (не обсуждается на реализации):
block.style — единственный источник гарнитуры, размера, цвета, выравнивания и
межстрочного. Inline-HTML внутри абзаца оставляет только bold, italic,
underline и ссылку. font-family, font-size и color из inline-разметки
ВЫРЕЗАЮТСЯ при сохранении. Не «приоритет CSS», а физическое отсутствие
конкурента в базе — иначе экран и PDF разойдутся.

1) Подсхема BlockStyle на TemplateBlock: fontFamily (белый список),
   fontSizePt (6..96), color (hex), align (left|center|right|justify),
   lineHeight (0.8..3). Поле необязательное, миграции НЕТ.
   bold/italic в схему НЕ добавлять — они остаются inline.

2) Белый список шрифтов + доказательство, что рендер их реально рисует.
   PDF рисует headless-браузер на сервере: нет гарнитуры в образе — молчаливая
   подстановка, оператор увидит в PDF не то, что на экране. Либо шрифт есть в
   образе, либо @font-face с файлом из репозитория. Способ на твой выбор,
   результат — в чеклист и в docs/pages/document-studio.page.md.
   Начать с минимума для коммерческого документа, список «на будущее» не заводить.
   Список — одна экспортируемая константа в модуле template-block, на неё же
   ссылается валидация DTO (фронт в S4 возьмёт её оттуда).

3) Sanitize при сохранении блока для ОБОИХ parent'ов (шаблон и
   studio-документ): вычищать font-family, font-size, color и опустевшие span.
   Сохранять b/strong, i/em, u, a[href], br, p, списки и токены подстановки
   {{путь.к.полю}} — формат токенов не ломать
   (document-render.service.ts:37-50). Чистая функция с юнит-тестами,
   не regexp внутри контроллера.

4) Рендер читает стиль блока в ОБОИХ путях (document-render.service.ts:82
   и :222): убрать хардкод 'Times New Roman' с body, оставив его дефолтом,
   применять style на контейнере блока. columns[].fontSize не ломать, но
   блочный fontSizePt — значение по умолчанию для колонки без своего размера.
   Значения стиля экранировать: color и fontFamily идут в CSS, инъекция
   через поле недопустима.

5) DTO create/update блока для шаблона и для studio-документа (без этого
   forbidNonWhitelisted вернёт 400 и фронт в S4 ничего не сохранит).
   PATCH одного поля стиля не затирает остальные.
   Тесты: sanitize; валидация (шрифт вне списка / размер вне диапазона /
   кривой hex → 400); golden HTML со стилем; РЕГРЕСС — блок без style даёт
   HTML побайтово как сегодня; PATCH не сбрасывает соседние поля.

ЖЁСТКИЕ ЗАПРЕТЫ:
- frontend/** и frontend-nx/** — ни строки.
- Не трогать templateId: required и dual-read cutover template_blocks.
- Не писать миграцию, не бэкфилить style существующим блокам.
- Не делать pageMargins, страницы, источники данных — это D2/D3/D5.
- Не заводить коллекций, прав, роутов; не менять document-template модуль.
- Не писать в docs/architecture/**, docs/adr/**, tasks/** кроме claim/archive.
  docs/pages/PAGE-TZ-INDEX.md — только строка в конец.
- Не деплоить, не трогать deploy/**, никакого wipe.

GATES (все зелёные до archive):
cd backend ; pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend ; pnpm test
cd backend ; pnpm lint
pnpm architecture:check
Плюс живая проверка через API на стенде (node start.mjs --no-browser):
создать блок со стилем, получить его назад, отрендерить HTML и PDF, показать
в чеклисте, что в выводе именно выбранный шрифт и размер.

Тихо остановиться нельзя: после каждого шага 1-5 строка в ## Gates чеклиста.
Не можешь выполнить — BLOCKED: <причина + путь>, Status BLOCKED, сказать явно.

ФИНАЛ: Integrity slot (docs/DOCS-INTEGRITY.md) → ## Executor report (auto)
(5 полей, полный 40-символьный SHA) → архив
tasks/_archive/2026-08/TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE.done.md +
ARCHIVE_MARKER → progress.md, _NOW.md, PAGE-TZ-INDEX.md, FIC §A →
commit/push своих файлов по docs/GIT-POLICY.md.
Отчёт: путь архива, белый список шрифтов и чем доказана их доступность в PDF,
результат четырёх гейтов, known_limitation.
```
