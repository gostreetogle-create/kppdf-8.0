# Audit: Desktop Excel Import Studio (спецификация проектировщика)

**Дата:** 2026-08-10  
**Источник:** диктовка PO после показа десктопа коллегам (MCP + желание Excel-импорта спецификации).  
**Связь:** север `docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md` (фундамент DONE); gap MCP `2026-08-10-mcp-sport-demo-audit.md` (TZD-31…34 READY, composition PARK).

---

## 1. Вердикт одной фразой

Розетка (pairing + MCP + flat Excel→ImportTask→propose/confirm) **есть**; того, что PO показывал «как в современных импортах» и что нужно проектировщику (**большое окно, вкладки, валидация дублей/коллизий, спецификация с составом**), **ещё нет** — это следующая волна, не переписывание архитектуры.

---

## 2. Сценарий PO (целевой)

```text
Проектировщик → Excel-спецификация изделия (материалы, модули, кол-ва, артикулы…)
        → Desktop: вкладка «Импорт Excel»
        → Drop / выбрать файл
        → Таблица-превью: распознавание колонок, статусы строк
        → Проверка: дубли в файле, пустые обязательные, коллизии с каталогом SoT
        → (опц.) «Проверить через ИИ» если MCP/AI подключен
        → «Отправить» → propose/confirm → SoT (без второй БД)
Параллельно вкладка «MCP»: то же подключение аккаунта, старт host для Cursor/LM Studio
```

Единый pairing/API; два канала наполнения: **ручной Excel-studio** и **ИИ через MCP**.

---

## 3. Что уже есть (можно опираться)

| Кусок | Где | Статус |
|-------|-----|--------|
| Tauri 2 + Svelte, одно окно | `desktop/` | OK |
| Pairing JSON → Nest | `App.svelte`, `pairing.ts` | OK |
| MCP host spawn | `mcpHost.ts` → `desktop/mcp` | OK (см. TZD-31 runtime drift) |
| Excel parse SheetJS (1-й лист) | `importers/excel.ts`, mcp `inbox.ts` | OK, узко |
| Inbox / expert propose / confirm materials(+products journal) | UI cards + MCP tools | OK, flat |
| ImportTask + HITL report/apply | BE `import-task`, MCP `import-task-tools` | OK |
| Column classify / reshape | TZD-26 DONE | OK для flat |
| Graph **read** composition | `kppdf_get_*_composition` | OK |
| Composition **write** MCP | — | **нет** (TZD-35 PARK) |

UI сейчас: **стопка карточек** Подключение → MCP → Импорт → Inbox (`App.svelte` ~670+), не вкладки; превью импорта — компактное, не «профессиональная студия».

---

## 4. Gaps под сценарий PO

| # | Gap | Почему больно |
|---|-----|----------------|
| G1 | Нет вкладок Excel \| MCP | Коллегам нечитаемо; pairing/MCP/import смешаны |
| G2 | Нет большого validation grid (new/update/skip/conflict) | «как в современных приложениях» |
| G3 | Parse = 1 лист, flat material aliases | Спецификация часто multi-sheet / иерархия |
| G4 | Нет composition propose | Спека «из чего состоит» не сядет в состав изделия |
| G5 | AI-check кнопка в UI | pipeline stub; MCP HITL есть, но не как явная кнопка студии |
| G6 | Runtime MCP drift | Без TZD-31 «проверить через ИИ» может звать старый toolset |
| G7 | Нет **сохранённых профилей сопоставления полей** | TZD-26 = one-shot `classifyColumns` + `columnMap` на task; нет UI «Excel-заголовок → наше поле», красных сомнительных, шаблонов «из SolidWorks / из …», default ★ |

**Термин (канон для TZ):** **профиль сопоставления полей** (EN: *field mapping profile* / *import mapping template*). Не «переходник» в UI — в подсказке можно: «Шаблон: как колонки Excel из другого ПО стыкуются с полями kppdf».

**Уже есть кирпичи:** `classifyColumns` → ready/unfit/mapping/conflicts (`desktop/mcp/src/inbox.ts`); `kppdf_inbox_classify_columns`; `kppdf_import_task_reshape` + `columnMap`. Не хватает: studio UI подтверждения, **persist named profiles** (org-scoped), default ★, AI-propose mapping → user confirm.

**Не строить:** вторая БД; silent write без confirm; обязательный bundled LLM; web ImportTask UI; заказы/КП bulk в этой волне; EAV «поля из воздуха» (маппить только на известный канон domain-schema).

---

## 5. План волны (минимум TZ, максимум работы)

| # | TZ | Слой | Суть |
|---|-----|------|------|
| 1 | **TZD-36** | Desktop UI | Import Studio shell: вкладки **Импорт Excel** \| **MCP**; pairing внутри MCP; большой drop+table chrome |
| 2 | **TZD-37** | Desktop + тонкий BE/MCP | **Профиль сопоставления** (auto-match + красные unfit + confirm + save/★ default) → валидация строк → multi-sheet → apply journal → опц. ИИ |
| 3 | **TZD-38** | MCP + journal/REST | Иерархия спецификации → module/product + **composition propose/confirm** |

Отдельный TZ на «только mapping» **не нужен** — это сердце TZD-37 (иначе 4 TZ). Persist профилей: local Desktop store **или** тонкий Nest collection `import_mapping_profiles` (org-scoped) — предпочтение **Nest**, чтобы шаблон жил между ПК (проектировщик/офис).

**Параллель с другими волнами**

- `WAVE-DICT-DEMO` — FE web; keys не пересекаются с `desktop/**` → можно другой агент.
- `WAVE-MCP-GAP` (31–34) — общий `desktop/mcp/src/tools.ts` → **не** параллелить с TZD-37/38; TZD-36 можно до/параллельно аккуратно.
- Рекомендация: **TZD-36 сразу**; 37 после 36; 38 после 37 (+ желательно TZD-31 DONE).

---

## 6. Архитектура to-be

```text
[Tab: Импорт Excel]
  Dropzone → parse (sheets[])
       → [Профиль сопоставления] auto-suggest + красные сомнительные
            ├─ Подтвердить / поправить
            ├─ Сохранить как профиль (+ ★ default)
            └─ (опц. ИИ) предложить map → тот же confirm UI
       → reshape rows by profile
       → validate rows → grid
       ├─ Отправить → ImportTask / journal propose → confirm → SoT
       └─ Проверить строки через ИИ (если MCP up) → merge flags

[Tab: MCP]
  Pairing + Start/Stop host + mcp.json snippet
       └─ тот же apiBaseUrl / token
```

SoT = Nest/Mongo. Desktop = оркестратор + HITL UI, не склад данных.

---

## 7. Проверено

`desktop/src/App.svelte`; `importers/excel.ts`; `mcp/src/tools.ts` / `inbox.ts` / `import-task-tools.ts` / `write-tools.ts` / `read-tools.ts`; BE `import-task.schema.ts`; audits 2026-08-08 bulk-import, 2026-08-10 mcp-sport; WAVE-MCP-GAP; WAVE-DESKTOP-BULK-IMPORT (DONE).
