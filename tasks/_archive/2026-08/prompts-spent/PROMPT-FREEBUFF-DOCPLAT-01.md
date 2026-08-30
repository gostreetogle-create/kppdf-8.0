# PROMPT — Freebuff #2 · DOCPLAT-01: порядок в задачах + снять legacy-студию живьём

Скопировать блок целиком. Docs/tasks-only волна, идёт **параллельно** с Freebuff #1 (S0).

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main. Работать до конца волны,
не спрашивать «продолжать?» посередине.

Контракт: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
        + .agents/skills/kppdf-context-preflight/SKILL.md
        + docs/PO-CANON.md + docs/PROJECT-MEMORY.md

CLAIM первым (до любой правки):
1) Get-Location + git rev-parse --show-toplevel → D:\kppdf-8.0
2) git fetch origin ; git merge origin/main ; git status --short
3) tasks/_active/TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.md + чеклист
   docs/agent-checklists/TZ-NX-DOCPLAT-01.md по _TEMPLATE.md
4) Status CLAIMED; Claim slot: agent_id: freebuff-docplat-01,
   claimed_at ISO-8601, workspace D:\kppdf-8.0
5) Параллельно идёт кодовая волна TZ-NX-DOCSTUDIO-S0-FOUNDATION
   (владеет frontend-nx/** и docs/pages/registries.page.md) — туда не писать.

ЗАДАНИЕ: tasks/TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.md, фазы A → B.
Карта модуля документов уже написана (docs/architecture/nx-doc-studio.md) —
её НЕ переписывать, НЕ дублировать и НЕ править. Твоя работа — порядок и
доказательства, не анализ.

A) Порядок в tasks/: 22 корневых TZ, у которых уже есть
   tasks/_archive/2026-08/<X>.done.md — убрать из корня (git rm либо
   _archive/2026-08/specs-dup-root/, если корень несёт уникальный текст).
   Прочие TZ → _backlog/<тема>/ + строка в _backlog/QUEUE.md (папка
   _backlog/nx/ уже есть, дубль не создавать). Отработанные PROMPT-* →
   _archive/2026-08/prompts-spent/. В корне оставить 6 служебных файлов из
   tasks/README.md + 5 файлов текущих волн (перечислены в TZ, фаза A.4).
   Обновить tasks/README.md.

B) node start.mjs --no-browser, снять legacy живьём в
   docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/ (≥12 скриншотов):
   /doc-constructor/templates ; /doc-constructor/builder/:id (размер,
   ориентация, поля страницы, палитра, блок в drag) ; /doc-constructor/studio
   (список, «Из шаблона») ; /doc-constructor/studio/:id — каждый рельс
   (Элементы, Слои, Шаблон, Данные, Свойства, Таблица), +/− страницы, диалог
   save-as-template ; /proposals/workspace (превью, таблица позиций,
   наследование контрагента) И то же в АЛЬБОМНОЙ ориентации ;
   /doc-constructor/texts ; /doc-constructor/tables.

   Отдельно замерить закон геометрии на КП в обеих ориентациях по чек-листу
   docs/pages/kp-workspace-geometry.md: ширина панели 480px, зазор листа
   справа ≈8px, прямоугольник листа идентичен при открытой и закрытой панели
   (Δ ≤ 0.5px). Числа брать из браузера, не на глаз, и записать в чеклист.

   По каждому экрану строка в ## Gates: работает / частично / падает +
   ошибки консоли и сети. Дефекты и мёртвые кнопки — в
   evidence/.../defects.md со шагами воспроизведения. НЕ ПАТЧИТЬ.

ЖЁСТКИЕ ЗАПРЕТЫ:
- Ни строки в frontend/**, frontend-nx/**, backend/**, package.json.
- Не писать в docs/architecture/**, docs/adr/**, docs/pages/*.page.md.
- Не трогать tasks/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md и чужой _active.
- Не создавать сущности, поля, endpoints, права; не менять схемы;
  не запускать миграции; не импортировать XLSX; не писать в Mongo.
- Не начинать реализацию студии в NX.
- Не проектировать склад, не предлагать другие модули переноса.
- Учётные данные не записывать в файлы и не коммитить.
- docs/pages/PAGE-TZ-INDEX.md — только дописать строку в конец.
- Не коммитить чужой WIP: backend/src/modules/unit/**,
  backend/src/modules/auth/**, backend/src/common/** — git add поимённо.
- Не удалять и не переписывать файлы в tasks/_archive/** и tasks/_park/**.
- Не деплоить, не трогать deploy/**, никакого wipe.

ФИНАЛ: Integrity slot (docs/DOCS-INTEGRITY.md) → ## Executor report (auto)
(5 полей, полный 40-символьный SHA) → архив
tasks/_archive/2026-08/TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.done.md +
ARCHIVE_MARKER → progress.md, _NOW.md, PAGE-TZ-INDEX.md →
commit/push своих файлов по docs/GIT-POLICY.md.
Отчёт: путь архива, сколько файлов убрано из корня tasks/, замеры геометрии
числами, число дефектов.
```
