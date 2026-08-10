═══════════════════════════════════════════════════════════════
TZD-37: Excel validation + профили сопоставления полей
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Desktop + MCP/BE thin (mapping profiles + validation + wire)
ЗАВИСИМОСТИ: TZD-36 DONE
LAYER: 3 (строго 1; не параллелить WAVE-MCP-GAP)
CONFLICT KEYS: desktop/src/**; desktop/src/importers/excel.ts; desktop/mcp/src/inbox.ts; desktop/mcp/src/inbox-tools.ts; desktop/mcp/src/import-task-tools.ts; backend/src/modules/import-task/**; backend/src/modules/import-mapping-profile/** (NEW ok); backend/src/app.module.ts; docs/agent-checklists/TZD-37.md

PAGES: (desktop)
PAGE_DOCS: docs/audits/2026-08-10-desktop-excel-import-studio-audit.md

Проверено: TZD-26 `classifyColumns` + ready/unfit/mapping/conflicts; reshape + task.columnMap; **нет** named saved profiles, нет studio UI confirm с красными unfit, нет ★ default.

Термин: **профиль сопоставления полей** (field mapping profile) = сохранённая связка «заголовки Excel источника → канонические поля kppdf».

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

PO: чужое ПО отдаёт те же смыслы под другими заголовками. Нужен промежуточный шаг синхронизации полей: авто-стыковка похожих, красные «надо подтвердить», сохранение шаблона, ★ по умолчанию; при MCP — ИИ предлагает map → человек подтверждает.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Multi-sheet
  - Список листов; выбор листа (эвристика имени ок).

ШАГ 2: UI «Сопоставление полей» (обязательный шаг до валидации строк)
  - Слева: заголовки Excel; справа: канон проекта (`article`, `name`, `unit`, `qty`, … из domain-schema / CANONICAL_COLUMNS; для BOM-полей — заготовка под TZD-38, можно disabled с hint).
  - Авто: вызвать/переиспользовать `classifyColumns` (и fuzzy уже в inbox).
  - **Готовые** (ready) — зелёный/нейтральный, pre-selected.
  - **Сомнительные / unfit / conflicts** — **красная** подсветка; нельзя «Отправить в каталог», пока пользователь не выберет канон или «Игнорировать колонку».
  - Dropdown на каждой строке: канон | игнорировать. Один канон ← максимум одна Excel-колонка (иначе conflict).
  - Кнопка «Подтвердить сопоставление» → reshape rows → переход к grid строк.

ШАГ 3: Профили (persist)
  - После confirm: «Сохранить профиль…» (имя, напр. «Спецификация X»).
  - Список профилей: выбрать / ★ сделать default / удалить.
  - При новом файле: если есть default ★ — применить автоматически, потом показать map UI (пользователь может поправить); иначе auto-classify с нуля.
  - Хранение: **Nest org-scoped** collection `import_mapping_profiles`  
    `{ name, isDefault, columnMap: Record<sourceHeaderPattern|exact, canonical>, targetEntity?: 'material'|'product'|'bom', organizationId }`  
    API CRUD тонкий; Desktop вызывает через pairing.  
    (Fallback only if BE blocked: local JSON — зафиксировать в checklist как known_limitation, не предпочитать.)

ШАГ 4: ИИ предлагает сопоставление
  - Кнопка «Предложить через ИИ» — только если MCP up.
  - Результат = тот же map UI (не silent apply): пользователь подтверждает, в т.ч. красные.
  - Отдельно (можно та же или вторая кнопка): «Проверить строки через ИИ» после map — merge doubt в row grid (как в прошлой редакции).

ШАГ 5: Validation engine строк (после map)
  - Статусы: `ok_new` / `ok_update` / `skip` / `conflict` / `error` (дубли артикула в файле, пустой артикул, коллизии SoT, qty).
  - Счётчики + фильтр + подсветка.

ШАГ 6: Apply
  - Отправить только выбранные ok_new/ok_update → journal propose → confirm.
  - Не silent SoT. Не EAV-поля вне канона.

ШАГ 7: Tests
  - classify → unfit red path; save profile → reload applies; duplicate article conflict; empty article error.
  - BE: profile unique name per org; only one isDefault.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Composition write graph (TZD-38)
- Commercial MCP (TZD-33)
- Web Angular forms / form-profiles (другое: S/M/L UI, не Excel headers)
- Forced bundled LLM; EAV

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. После drop Excel открывается шаг сопоставления: похожие поля стыкованы; непохожие — красные, пока не поправлены/игнор.
2. Подтверждение → таблица строк с каноническими колонками; без confirm map «Отправить» недоступен.
3. Сохранённый профиль + ★ default: второй файл с теми же заголовками подхватывает профиль; можно выбрать другой.
4. ИИ-propose map (MCP on) заполняет UI, не пишет SoT без confirm; MCP off → кнопка disabled + hint.
5. Дубли артикулов / пустой артикул / SoT collision — как статусы строк до Отправить.
6. Multi-sheet выбор работает.
7. Gates: desktop + mcp tests; BE tsc + jest profiles; archive + Executor report + commit/push.

known_limitation: BOM-specific canonical columns fully enforced in TZD-38; batch 10k out of scope.
