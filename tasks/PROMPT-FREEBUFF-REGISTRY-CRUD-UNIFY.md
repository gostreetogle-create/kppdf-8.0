# PROMPT — Freebuff · REGISTRY-CRUD-UNIFY: единый CRUD во всех реестрах + снос «Конструктора»

Скопировать блок целиком. Длинная волна в `frontend-nx`, идёт **параллельно** с backend-волной D1.

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main. Работать до конца волны,
не спрашивать «продолжать?» посередине. Волна длинная — не бросать на середине
списка реестров.

Контракт: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
        + .agents/skills/kppdf-context-preflight/SKILL.md
        + docs/PO-CANON.md + docs/PROJECT-MEMORY.md
Перед UI: docs/ui-rules.md + docs/DIALOG-COOKBOOK.md + docs/UX-FORM-CANON.md
Платформа реестров: docs/pages/registries.page.md

CLAIM первым (до любой правки), все пункты обязательны:
1) Get-Location + git rev-parse --show-toplevel → D:\kppdf-8.0
2) git fetch origin ; git merge origin/main ; git status --short
3) СОЗДАТЬ tasks/_active/TZ-NX-REGISTRY-CRUD-UNIFY.md
4) СОЗДАТЬ docs/agent-checklists/TZ-NX-REGISTRY-CRUD-UNIFY.md по _TEMPLATE.md;
   Status CLAIMED; Claim slot agent_id: freebuff-registry-crud-unify,
   claimed_at ISO-8601, workspace D:\kppdf-8.0
5) Сверить _NOW.md и чужие tasks/_active/*. Параллельно идёт backend-волна
   TZ-BACKEND-DOCSTUDIO-BLOCK-STYLE (владеет backend/**) — туда не писать.

ВНИМАНИЕ, ЧУЖОЙ WIP В РАБОЧЕЙ КОПИИ: незакоммиченные правки чужой волны по
авторизации — backend/src/common/**, backend/src/modules/auth/**,
backend/src/modules/unit/**, docs/pages/login.page.md, docker-compose.yml,
frontend/src/app/pages/doc-constructor/studio/**. Не трогать, не откатывать,
не коммитить. git add строго поимённо.

ЗАДАНИЕ: tasks/TZ-NX-REGISTRY-CRUD-UNIFY.md, шаги 1→4 по порядку.

ЗАЧЕМ (словами PO): он открыл /registries и увидел, что реестры сделаны
не однотипно. Требование: любая таблица в реестре ведёт себя одинаково —
поиск, пагинация, раскрытие строки и полный набор действий
редактировать / копировать / удалить. Кнопок «Открыть в Конструкторе» быть
не должно, раздел «Конструктор» удаляется целиком.
Принцип: всё, что лежит в реестре, должно быть редактируемым, добавляемым и
удаляемым. Если запись править нельзя — такая таблица в реестр не выносится.

1) Единый контракт действий строки: один общий фабричный хелпер рядом с
   registry-row-action-button, порядок всегда Редактировать (pencil) →
   Копировать (copy) → доменные действия → Удалить (danger, последняя).
   Destructive называется «Удалить» везде, где endpoint DELETE — слово
   «Архивировать» убрать, оператор не должен угадывать, что это одно и то же.
   Подтверждение до запроса. Копирование без duplicate-endpoint — клиентски:
   предзаполненная форма создания, в названии «… — копия». Серверных роутов
   не изобретать. НЕ копипастить набор действий в каждое определение.

2) Довести каждый реестр до полного набора (детали и пути в TZ):
   units — добавить Редактировать (PATCH /units/:key) и Удалить
     (DELETE /units/:key); «копировать ключ» убрать из действий строки,
     ключ остаётся видимым в колонке; toggle активности оставить доменным.
   organizations, supply-requests, product-passports — сейчас read-only без
     единой кнопки при полном CRUD в API: формы создания и редактирования,
     удаление. Переходы статуса заявки (ordered/received/cancel) — доменные
     действия, отдельно от CRUD. Паспорт создаётся только от изделия
     (productId unique) — форма обязана требовать выбор изделия и показывать
     до отправки, что паспорт уже есть.
   modules — добавить Копировать и поиск (клиентский, API без query).
   materials / details / products — убрать row action «Открыть в Конструкторе»,
     «Архивировать» → «Удалить».
   text-blocks / table-templates (из S0) — привести к тому же набору, добавить
     Копировать.
   departments — убрать из production-каталога: фикстура без backend,
     по принципу PO ей нечего делать в реестре.

3) Снос «Конструктора»: удалить роуты /constructor и /constructor/create/:kind,
   страницы constructor.page.ts, constructor-create-placeholder.page.ts,
   constructor.types.ts и их спеки; убрать пункт из nav-categories.ts и
   заголовочной навигации; прогрепать frontend-nx/** на constructor и убрать
   остатки; зафиксировать снятую способность в docs/pages/registries.page.md и
   docs/CAPABILITY-LEDGER.md.

4) СПЛОШНАЯ ПРОВЕРКА ОДНОТИПНОСТИ — главный результат волны.
   Таблица «реестр × 12 проверок» в чеклисте: вход из меню · поиск · фильтры
   реально фильтруют · пагинация соответствует заявленному режиму · раскрытие
   строки · создать · редактировать · копировать · удалить с подтверждением ·
   loading/error/empty · 0 ошибок в консоли и сети · ни одной мёртвой кнопки.
   Клетка «нет» — либо исправлена в этой волне, либо строкой в known_limitation
   с причиной. Заполнять по факту обхода в браузере, не по коду.

   ОСОБО: реестры text-blocks и table-templates из S0 в браузере не проверялись
   ни разу (в его чеклисте прямо стоит «Browser evidence: not captured»).
   Проверять как непроверенные: печатает ли rich-text и сохраняется ли
   содержимое, работает ли добавление/удаление колонок, не пусты ли селекты
   категории и источника данных.

ЖЁСТКИЕ ЗАПРЕТЫ:
- backend/** и frontend/** — ни строки. Нужного endpoint нет → решай клиентски.
- Не изображать server-пагинацию и не придумывать query-параметры: где API
  отдаёт список целиком, поиск и фильтр клиентские, и это честно написано
  в registries.page.md.
- Не добавлять сущности, поля, права. Не заводить «системные» флаги, чтобы
  обойти правило PO: нельзя править — не выносим в реестр.
- Не трогать студию документов и её срезы (docs/architecture/nx-doc-studio.md),
  не создавать роут /studio.
- Не добавлять any, raw HttpClient в компоненты, npm-зависимости.
- Не писать в docs/architecture/**, docs/adr/**, tasks/** кроме claim/archive.
  docs/pages/PAGE-TZ-INDEX.md — только строка в конец.
- Не деплоить, не трогать deploy/**, никакого wipe.

GATES (все зелёные до archive):
cd frontend-nx ; pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
cd frontend-nx ; pnpm test
cd frontend-nx ; pnpm lint
pnpm architecture:check
node start.mjs --nx --no-browser → обход ВСЕХ реестров, скриншоты в
docs/agent-checklists/evidence/TZ-NX-REGISTRY-CRUD-UNIFY/
Известные красные вне твоей зоны: ESM-падение в
frontend-nx/libs/features/src/lib/pi-group-workspace.component.spec.ts и
3 старых cross-page нарушения architecture:check. Если упирается только в них —
это known_limitation с точным путём, а не повод не закрывать волну. Если сможешь
снять дешево и без риска — сними и напиши отдельной строкой.

Тихо остановиться нельзя: после каждого шага 1-4 строка в ## Gates чеклиста.
Не можешь выполнить — BLOCKED: <причина + путь>, Status BLOCKED, сказать явно.

ФИНАЛ: Integrity slot (docs/DOCS-INTEGRITY.md) → ## Executor report (auto)
(5 полей, полный 40-символьный SHA) → архив
tasks/_archive/2026-08/TZ-NX-REGISTRY-CRUD-UNIFY.done.md + ARCHIVE_MARKER →
progress.md, _NOW.md, PAGE-TZ-INDEX.md, FIC (снятая способность «Конструктор») →
commit/push своих файлов по docs/GIT-POLICY.md.
Отчёт: путь архива, таблица «реестр × 12 проверок» числами (сколько клеток
«да» из общего числа), что снесено вместе с «Конструктором», known_limitation.
```
