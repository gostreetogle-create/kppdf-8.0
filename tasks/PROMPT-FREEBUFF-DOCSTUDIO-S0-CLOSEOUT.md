# PROMPT — Freebuff · DOCSTUDIO-S0 CLOSEOUT: снять чужую поломку теста, добить гейты и архив

Скопировать блок целиком. Короткая добивающая волна: **код S0 уже написан**, закрываем хвост.

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main. Работать до конца волны,
не спрашивать «продолжать?» посередине.

Контракт: GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md
        + docs/PO-CANON.md
TZ: tasks/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md (уже в tasks/_active/)
Чеклист: docs/agent-checklists/TZ-NX-DOCSTUDIO-S0.md (claim держится за
freebuff-docstudio-s0-r2 — продолжаешь его, новый claim не создавать)

СОСТОЯНИЕ, ПРОВЕРЕНО КУРСОРОМ — не переделывай сделанное:
готово шаги 1-5 — alias @kppdf/ui/rich-text, 4 сервиса в
libs/data-access/src/lib/doc-studio/, реестры text-blocks и table-templates
с диалогами и http-data-source, doc-studio-registry-actions, регистрация в
registries.catalog.ts, спеки. tsc зелёный.
НЕ сделано: pnpm test (упирается в чужую поломку, см. шаг 1), lint,
architecture:check, браузерная проверка, docs/pages/registries.page.md
(0 упоминаний новых реестров), Integrity slot, Executor report, архив, коммит.

1) СНЯТЬ ЧУЖУЮ ПОЛОМКУ ТЕСТА (она блокирует весь pnpm test):
   frontend-nx/apps/kppdf-web/src/app/pages/registries/data/
   registries-catalog-test-mocks.spec.ts — это файл-хелпер с моками
   organizations/passports/supply-requests, в нём НОЛЬ тестов, поэтому jest
   валит сьют «must contain at least one test». Файл пришёл из более ранней
   волны реестров, к S0 отношения не имеет.
   Починка: переименовать в registries-catalog-test-mocks.ts (убрать .spec)
   и обновить три импорта:
     registries/registry-detail-panel.component.spec.ts:11
     registries/registries.routes.spec.ts:15
     registries/data/registry-action-matrix.spec.ts:21
   Тестов не выдумывать, содержимое хелпера не менять. Отдельной строкой в
   чеклист: снята чужая поломка, файл и причина.

2) ГЕЙТЫ, все четыре до зелёного:
   cd frontend-nx ; pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
   cd frontend-nx ; pnpm test
   cd frontend-nx ; pnpm lint
   pnpm architecture:check
   Красный гейт из-за своего кода — чинить. Красный из-за чужого — точный путь
   и причина в known_limitation, не «наверное».

3) БРАУЗЕР: node start.mjs --nx --no-browser → обойти оба реестра живьём:
   создать текст (rich-text реально печатает и сохраняет), отредактировать,
   архивировать; создать вид таблицы, добавить и удалить колонку, сохранить.
   Скриншоты в docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-S0/.
   0 ошибок в консоли и сети. Что не работает — в defects-строку чеклиста.

4) ДОКУМЕНТАЦИЯ: docs/pages/registries.page.md — две строки в таблицу реестров
   (стало 11), строки в таблицу filters/pagination с честным режимом
   (client, потому что API отдаёт список целиком), короткая секция про два
   новых диалога, обновить дату «Обновлено».

5) ИСПРАВИТЬ ЗАПИСЬ В ЧЕКЛИСТЕ (важно для истории): в ## Attempt log пункт про
   Attempt 1 сейчас неверен. Факт: попытка 1 всё-таки сделала шаги 1-2 —
   rich-text/index.ts, alias и 4 сервиса data-access, — но не создала claim,
   не прогнала гейты и не закоммитила; эти файлы попали в git в составе
   коммита 406a7952 (сквозная фиксация frontend-nx). Переписать пункт по факту.

6) ЗАКРЫТИЕ: Status DONE, Integrity slot по docs/DOCS-INTEGRITY.md,
   ## Executor report (auto) — 5 полей, полный 40-символьный SHA →
   архив tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S0-FOUNDATION.done.md +
   ARCHIVE_MARKER → удалить tasks/_active/TZ-NX-DOCSTUDIO-S0-FOUNDATION.md →
   progress.md, _NOW.md, FIC §A → commit/push по docs/GIT-POLICY.md.

ЖЁСТКИЕ ЗАПРЕТЫ:
- backend/** и frontend/** — ни строки.
- Не переписывать уже готовые реестры, диалоги и сервисы «под свой вкус».
- Не открывать публичный путь для canvas/**, не создавать роут /studio.
- Не изображать server-пагинацию, не придумывать query-параметры.
- Не писать в docs/architecture/**, docs/adr/**, tasks/** кроме claim/archive.
  docs/pages/PAGE-TZ-INDEX.md — только строка в конец.
- git add поимённо. НЕ коммитить чужой WIP: backend/src/modules/unit/**,
  backend/src/modules/auth/**, backend/src/common/**, застейдженные tasks/**
  и docs/agent-checklists/** от волны TZ-NX-DOCPLAT-01.
- Не деплоить, не трогать deploy/**, никакого wipe.

Тихо остановиться нельзя: после каждого пункта 1-6 строка в ## Gates чеклиста.
Не можешь выполнить — BLOCKED: <причина + путь>, Status BLOCKED, сказать явно.

Отчёт: путь архива, результат четырёх гейтов числами, что видно на /registries,
снятая чужая поломка, known_limitation.
```
