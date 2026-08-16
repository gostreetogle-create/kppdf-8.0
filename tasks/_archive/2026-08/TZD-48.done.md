# TZD-48: Desktop Import Studio — блокеры релиза 0.5.3

> Аудит: независимый review незакоммиченной сессии 2026-08-16  
> (Excel rework + multi-table + AI-runner + inbox).  
> Доки сессии: `docs/audits/2026-08-16-desktop-excel-import-rework.md`,  
> `docs/audits/2026-08-16-desktop-ai-runner-phase2.md`.  
> **Цель:** снять блокеры, после которых можно коммитить и собирать 0.5.3.

РОЛЬ АГЕНТА: Desktop (+ тонкий BE import-mapping-profile)

ЗАВИСИМОСТИ: нет (WIP сессии уже в рабочем дереве — **не откатывать**)

LAYER: 3 (`App.svelte` + ai-runner — один агент, без параллели на те же keys)

CONFLICT KEYS: `desktop/src/ai-runner/index.ts` ; `desktop/src/core/aiRunner.ts` ; `desktop/src/core/multi-import.ts` ; `desktop/src/core/import-targets.ts` ; `desktop/src/importers/excel.ts` ; `desktop/src/App.svelte` ; `desktop/src/core/ai/suggest-mapping.ts` ; `backend/src/modules/import-mapping-profile/**`

PAGES: N/A (Tauri desktop, не SPA-route)  
PAGE_DOCS: `desktop/docs/INSTALL.md` (если трогаешь текст про модель) ; иначе N/A

CHECKLIST: `docs/agent-checklists/TZD-48.md`  
REVIEW: required (Cursor Verdict PASS до archive)

---

## Domain preflight

| Говорят | Канон в коде |
|---------|----------------|
| Клиент / контрагент | **Counterparty** (`/api/counterparties`) |
| Изделие | **Product** (`/api/products`) |
| Модуль | **Module** (`/api/modules`) |
| Материал | **Material** + mutation journal proposals |
| SoT | Mongo через REST; desktop **не** пишет молча |

Проверено: `desktop/src/App.svelte` (`sendBlocks` ~1102–1167, `createEntities` ~1030–1099, `finalizeInboxFileIfDone` ~1149); `desktop/src/ai-runner/index.ts` (`ensureModel` ~65–72, `POST /download` ~259–267); `desktop/src/core/aiRunner.ts` (`downloadModel` ~297–339, `defaultModelDir` ~60–62); `desktop/src/core/multi-import.ts` (`applyTableMapping` ~48–62); `desktop/src/importers/excel.ts` (`excelImporter.parse` ~106–112); `backend/.../import-mapping-profile.schema.ts` (`bom` в enum); `docs/PO-CANON.md` (Desktop = HITL import).

Loose wording → канон: «отправить на подтверждение» в UI сейчас = для materials journal, для product/module/counterparty — **сразу create**. В этой TZ честно чиним UX (см. шаг 3), полный journal для всех сущностей — **не** scope (→ TZD-49).

---

## ИСХОДНОЕ СОСТОЯНИЕ (факты)

1. **Download broken:** `POST /download` ждёт весь GGUF; клиент `AbortSignal.timeout(30_000)` → почти всегда fail; poll статуса не стартует.
2. **`models/` не mkdir** — первый download на чистой машине → ENOENT.
3. **Sticky `modelLoadError`:** нет файла → ошибка навсегда; после скачивания без рестарта процесса модель «недоступна».
4. **SoT-ложь:** hint «До вашего подтверждения ничего не записывается» + кнопка «Отправить на подтверждение», но `createEntities` пишет product/module/counterparty сразу.
5. **`processed/` после фейла:** `finalizeInboxFileIfDone` двигает файл, если нет `proposalIds` — даже при `created: 0`.
6. **`applyTableMapping`:** отсутствующие ключи в частичной AI-карте → `null` → все эвристики сбрасываются в ignore.
7. **Inbox Excel:** `excelImporter.parse` берёт `sheets[0]`, не первый лист с данными (ручной drop через `parseExcelWorkbook` — ок).
8. **BE/FE drift:** backend enum содержит `bom`; desktop `ImportTargetKey` — нет → throw при apply.
9. **BE create** допускает профиль без `tables` и без `columnMap`.
10. Версия уже `0.5.3` в `desktop/package.json` / `tauri.conf.json`. Юнит-гейты зелёные, живой download модели **не** прогонялся.

---

## ЧТО ДЕЛАТЬ

### 1. AI-runner: контракт скачивания + каталог + sticky error

1. `POST /download` — принять задачу и **сразу** ответить `{ ok: true }` (фон); прогресс только в `GET /download/status`. Отклонять второй active job.
2. Перед записью `.tmp`: `fs.mkdirSync(MODEL_DIR, { recursive: true })` (или async mkdir).
3. URL: принимать **только** URL из каталога моделей / allowlist `https://huggingface.co/...`; на каждом redirect — повторная проверка host/scheme; отказ иначе.
4. `ensureModel`: отсутствие файла **не** sticky; сбрасывать `modelLoadError` при появлении файла / успешном конце download; реальные load-exception можно sticky до reload.
5. Клиент `aiRunner.downloadModel`: короткий timeout только на «принять job»; дальше poll status. `modelLoaded` = true **только** после `/health` с `modelLoaded: true` (после скачивания оставить false + сообщение «Перезапустите раннер»).

### 2. `applyTableMapping` — частичный merge

Менять только заголовки, **присутствующие** в `sourceMap`. Остальные оставить как после `classifyHeaders`. Пустой `{}` от AI **не** должен обнулять всю карту.

### 3. Честность SoT + `processed/` (hotfix policy A)

**Policy A (обязательна в этой TZ):** журнал для materials без изменений; product/module/counterparty могут писать сразу, но:

1. Текст шага 2 и кнопка **не** обещают «только подтверждение», если в блоках есть non-material. Динамика:
   - только materials → «Отправить на подтверждение» + hint про журнал;
   - иначе → «Записать в каталог» (или смешанный label) + hint, что изделия/модули/контрагенты попадут в SoT **сразу**, материалы — в журнал.
2. Перед non-material write — `confirm()` / диалог: сколько строк, какие таблицы.
3. `finalizeInboxFileIfDone`: перенос в `processed/` **только если** `(created + proposed) > 0` и нет блокера «все строки упали»; при полном фейле — **не** двигать (опционально лог в inbox log).
4. Пока `activeInboxFile` открыт в студии — скрыть/disable inbox-кнопки «Предложить строки» / «Создать задачу для ИИ» на этом файле (один write-path).

### 4. Inbox Excel = тот же разбор листа, что у ручного drop

`excelImporter.parse` (и/или `auditInboxFile`): использовать лист с данными (`firstWithRows` / activeSheet из workbook), не слепой `sheets[0]`. Если у inbox-пути нет UI sheet picker — хотя бы первый непустой лист + понятная ошибка если пусто.

### 5. Валидация + профили BE/FE

1. Counterparty: `requiredFields` включает `inn` (согласовать с `createEntities`).
2. `blocksFromProfile` / apply: неизвестный `targetEntity` (в т.ч. `bom`) — **пропуск + RU-сообщение**, не throw.
3. BE: create профиля без `tables` и без непустого `columnMap` → **400**.
4. BE: на update, если пришли `tables` — не оставлять противоречивый legacy `columnMap` «молча» (синхронизировать с `tables[0]` или `$unset` legacy; если пришёл только `columnMap` при уже существующих `tables` — либо re-normalize `tables`, либо 400 с понятной ошибкой). Предпочтение: одна SoT-форма после записи.
5. BE enum: либо убрать `bom` из `IMPORT_MAPPING_TARGETS`, либо оставить с desktop-skip (выбрать минимальный путь; задокументировать в checklist).

### 6. Копи вкладки «Модель» (минимум)

Убрать обещание «модель загрузится сама». Коротко: Запустить → Скачать → **Перезапустить** → «Предложить сопоставление». Имя вкладки студии в текстах = фактическое («Студия импорта»), не «Импорт Excel».

### 7. Тесты + gates

Добавить focused тесты минимум на:

- download job returns before bytes finish (unit/mock или контракт handler);
- applyTableMapping partial merge;
- counterparty без inn → error;
- excel parse: пустой sheet0 / данные на sheet1;
- BE: reject empty profile; (по возможности) update dual-state.

Gates (обязательны):

```text
cd desktop && npx tsc --noEmit
cd desktop && npx svelte-check --threshold error
cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/excel.test.ts
cd backend && npx jest src/modules/import-mapping-profile --no-coverage
```

---

## ИЗМЕНЯТЬ

- Файлы из CONFLICT KEYS
- Тесты рядом: `desktop/src/core/multi-import.test.ts`, `excel.test.ts`, `aiRunner`-смежные если появятся, `import-mapping-profile.service.spec.ts`
- Checklist `docs/agent-checklists/TZD-48.md`
- Краткая правка audit-дока (1 абзац «блокеры закрыты TZD-48») — опционально

## НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ

- Не откатывать WIP Excel / multi-table / AI-runner сессии (работать поверх)
- Не коммитить `data/**`, `docs/PO-DIARY.md`, `TZ-UX-331*`, page-docs вне desktop, чужой WIP
- Не строить полный mutation journal для product/module/counterparty (→ TZD-49)
- Не GPU / `gpuLayers` / новые модели сверх каталога
- Не менять версию с 0.5.3 (оставить)
- Не deploy / wipe / production
- Не расширять Tauri FS scope дальше текущего `$HOME/**` без отдельной TZ
- Не трогать `desktop/mcp/**` кроме чтения для паттерна

---

## КРИТЕРИИ ПРИЁМКИ

- [ ] POST `/download` возвращает успех за секунды; UI показывает прогресс до конца (или mock-тест контракта)
- [ ] Первый download создаёт `models/` без ENOENT
- [ ] После скачивания без рестарта: health/чат не залипают навечно на «модель не скачана» из-за sticky missing-file; после **Перезапустить** — load возможен
- [ ] UI не врёт про SoT: non-material write только с честной кнопкой + confirm
- [ ] Inbox файл не уезжает в `processed/` при полном провале send
- [ ] Частичная AI-карта не обнуляет эвристики
- [ ] Inbox Excel читает лист с данными
- [ ] Counterparty без ИНН не `ok_new`
- [ ] `bom`/unknown target не роняет студию
- [ ] BE не сохраняет пустой профиль
- [ ] Gates выше PASS
- [ ] Commit(+push по GIT-POLICY) **только** conflict keys + тесты + checklist; без `data/`
- [ ] `## Executor report (auto)` в checklist; Cursor review PASS → archive `tasks/_archive/2026-08/TZD-48.done.md` + lock

---

## known_limitation (successor TZD-49)

- Journal HITL для product/module/counterparty (единый write-path)
- Spec confirm lookup без `limit=100` (поиск по article)
- Размеры/вес CAD-колонок в маппинг; имена пустых модулей CAD
- Session-per-chat для Llama; auto-restart после download
- Живой прогон GGUF на файле PO; сужение FS scope / CSP
- Sample rows в AI-промпт сопоставления

---

## Финализация

Root cycle: checklist → gates → review → `tasks/_archive/2026-08/TZD-48.done.md` + `.mimocode/locks/TZD-48-*.lock` + progress; убрать `tasks/_active/TZD-48.md`.  
Канон: `GEMINI.md` + `docs/GIT-POLICY.md`. Deploy **нет**.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T12:25:00+03:00
closed_by: buffy (desktop executor)
TZ: TZD-48
DEP: none (WIP сессии 2026-08-16 в рабочем дереве)

verification:
  - acceptance criteria: PASS (все 10 блокеров из TZ)
  - typecheck: PASS (desktop + backend tsc --noEmit)
  - svelte-check: PASS (0 errors, 0 warnings)
  - desktop tests: PASS 46/46 (вкл. новые: partial AI map, counterparty inn, sheet-with-data, URL allowlist)
  - backend jest: PASS 12/12 (import-mapping-profile: empty profile 400, dual-state normalize)
  - smoke ai-runner: PASS (non-HF URL отклонён, job принят мгновенно, models/ создан)
  - checklist: DONE (docs/agent-checklists/TZD-48.md)
  - progress.md: UPDATED
  - cursor verdict: PASS (b03ecc22060f4d20c6d559c043910ea4701b5d87)
  - commit: b03ecc22060f4d20c6d559c043910ea4701b5d87 (pushed e108e22a..b03ecc22 → main)

## Outcome

- **AI-runner скачивание:** `POST /download` принимает задачу и отвечает мгновенно; прогресс — только в `GET /download/status`; каталог `models/` создаётся (mkdir recursive); URL строго из allowlist (HTTPS Hugging Face, проверка на каждом редиректе); «файл не скачан» не sticky — после скачивания «Перезапустить» загружает модель.
- **Частичный merge AI-карты:** `applyTableMapping` меняет только присутствующие ключи; пустой `{}` от модели не обнуляет эвристики классификатора.
- **Честность SoT:** блоки с изделиями/модулями/контрагентами — кнопка «Записать в каталог» + `confirm()` перед записью; hint в шаге 2 предупреждает о прямом создании; материалы — через журнал предложений. `finalizeInboxFileIfDone` переносит в `processed/` только при (proposed+created)>0.
- **Inbox Excel:** импортёр читает лист с данными (activeSheet), а не слепой `sheets[0]`; понятная ошибка при отсутствии данных.
- **BE/FE валидация:** counterparty `requiredFields: ['name','inn']`; `bom` убран из `IMPORT_MAPPING_TARGETS`; `isImportTargetKey` guard + RU-сообщение для неизвестных сущностей; BE отклоняет пустой профиль (400) и нормализует legacy `columnMap` в `tables` при update (одна SoT-форма).
- **Копи «Модель»:** честный порядок «Запустить → Скачать → Перезапустить»; название вкладки — «Студия импорта».

## Verification

- `desktop npx tsc --noEmit`: PASS
- `desktop npx svelte-check --threshold error`: PASS (0/0)
- `desktop npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts`: PASS 46/46
- `backend npx jest src/modules/import-mapping-profile --no-coverage`: PASS 12/12
- Smoke ai-runner (port 9785): PASS
- deploy: NOT RUN (PO: no deploy)

## Files

- `desktop/src/ai-runner/index.ts`, `desktop/src/ai-runner/security.ts`, `desktop/src/ai-runner/security.test.ts`
- `desktop/src/core/aiRunner.ts`, `desktop/src/core/multi-import.ts`, `desktop/src/core/multi-import.test.ts`
- `desktop/src/core/import-targets.ts`, `desktop/src/core/import-mapping-profiles.ts`
- `desktop/src/importers/excel.ts`, `desktop/src/importers/excel.test.ts`
- `desktop/src/App.svelte`, `desktop/src/core/config.ts`
- `desktop/src/core/ai/suggest-mapping.ts`, `desktop/src/core/ai/suggest-mapping.test.ts`
- `desktop/src/core/import-mapping.ts`, `desktop/src/core/import-mapping.test.ts`
- `desktop/src/core/specification-import.ts`, `desktop/src/core/specification-import.test.ts`
- `desktop/src/core/model-catalog.ts`, `desktop/src/core/model-catalog.test.ts`
- `desktop/src-tauri/capabilities/default.json`, `desktop/package.json`, `desktop/pnpm-lock.yaml`, `desktop/pnpm-workspace.yaml`, `desktop/src-tauri/tauri.conf.json`
- `backend/src/modules/import-mapping-profile/dto/import-mapping-profile.dto.ts`
- `backend/src/modules/import-mapping-profile/import-mapping-profile.schema.ts`
- `backend/src/modules/import-mapping-profile/import-mapping-profile.service.spec.ts`
- `backend/src/modules/import-mapping-profile/import-mapping-profile.service.ts`
- `docs/agent-checklists/TZD-48.md`

## Known limits (successor TZD-49)

- Journal HITL для product/module/counterparty (единый write-path)
- Spec confirm lookup без `limit=100` (поиск по article)
- Размеры/вес CAD-колонок в маппинг; имена пустых модулей CAD
- Session-per-chat для Llama; auto-restart после download
- Живой прогон GGUF на файле PO; сужение FS scope / CSP
- Sample rows в AI-промпт сопоставления
