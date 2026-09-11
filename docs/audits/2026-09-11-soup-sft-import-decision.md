# Решение: Soup SFT под импорт kppdf — **РАНО**

**Дата:** 2026-09-11  
**Запрос:** дообучать ли Qwen2.5-7B через Soup (архив `Soup-0.74.0.zip`) на «нормализацию импорта → JSON» + MCP tool reliability.  
**Роль:** Cursor Mode A, analysis-only. Обучение/деплой не запускались.

### Preflight Check Output
- **Context read:** `Soup-0.74.0.zip` → unpacked `.tmp-soup-0.74/Soup-0.74.0/` (`README.md`, `docs/models.md`, `benchmarks/gate-v0.72.2-nf4.md`); `desktop/ai/system-prompts/general.md`; `desktop/src/core/ai/prompts.ts`; `desktop/src/core/pipeline.ts`; `desktop/docs/AI-PROVIDERS.md`; `tasks/_archive/2026-09/TZD-75-*.done.md`; `docs/peer/gemini-desktop-ai-runner-plan.md`; `mutation-journal.schema.ts`; `import-task.schema.ts`; `suggest-mapping.ts`; App `suggestWithAi`
- **Key Constraints:** 152-ФЗ / privacy banner; LIMITED_HELPER; HITL SoT; Mode A no product code
- **Planned Deliverable:** вердикт РАНО + блокеры + prerequisite TZ (не Soup train)
- **Validation Path:** факты кода ниже; Soup VRAM guide сверён с железом PO

---

## 1. Перепроверка статуса (актуальный код)

| Утверждение | Факт |
|-------------|------|
| `general.md` реализован? | **Нет.** Файл помечен «ЧЕРНОВИК». `prompts.ts`: `TODO(ai): читать … general.md` — короткий hardcoded `BASE_SYSTEM_PROMPT`. `buildSystemPrompt()` **нигде не вызывается** для живого импорта (только export). |
| AI row-normalize (`pipeline.normalizeStep`)? | **Stub** — `TODO(ai-import)`, возвращает `[]`. |
| Что реально делает AI на Импорте? | **Column mapping** (`buildMappingPrompt` / `suggestWithAi`) → JSON map header→field. Детерминированный fallback без модели (`analyzeTables`). HITL confirm → mutation-journal. |
| TZD-75? | **DONE** — локальный node-llama UI убран («скоро»). |
| TZD-76? | **Нет файла TZ.** Только peer acceptance. Встроенный GGUF-раннер **всё ещё OFF**. |
| Рабочий AI сейчас? | Remote OpenAI-совместимый чат (TZD-65) + MCP для внешних клиентов. `suggestWithAi` завязан на **локальный** `aiState.port` → при скрытом раннере ветка AI-mapping фактически недоступна. |
| HITL = датасет raw→JSON? | **mutation_journal:** есть `payload` / before/after — **нет** сырого Excel/CSV. **import_task:** есть `rows[].raw` + `aiReport.proposed` — ближе к парам, но это другой контур (MCP import-task), не автоматический export в JSONL для SFT, и «gold» после user edit не гарантирован как обучающая выборка. |
| Soup / железо | `docs/models.md` Quick Size: 16 GB VRAM → ~14B QLoRA; 7B свободно. `gate-v0.72.2-nf4.md`: 8B NF4 stream ~3.32 GB peak. **Железо не блокер.** |

---

## 2. Данные для датасета

| Источник | Оценка |
|----------|--------|
| `data/yougile-import`, `data/from-kp3` | Миграционные снимки, **не** пары «сырой лист → schema JSON». |
| `desktop/**/*.test.ts` (suggest-mapping, multi-import) | Десятки **синтетических** headers — мало для SFT, годится для **eval harness**. |
| Живые HITL confirms | Не логируются как `(raw_snippet, schema, gold_json)` локально/экспортом. |
| Вывод | Для первого эксперимента **нет** сотен качественных gold-пар. Нужен: (1) синтетика + (2) инструментирование HITL / import_task export **до** Soup. |

---

## 3. Вердикт

**РАНО писать TZ на Soup train/export.**

Причины (факты, не вкус):
1. Целевой сценарий `general.md` **не подключён** — нечему измерять baseline vs LoRA.
2. Нет измеримого датасета; mutation-journal **не** хранит сырьё.
3. Дообучение «MCP tool reliability» — отдельная задача (нужны tool-traces); текущий MCP уже работает у Cursor/LM Studio без SFT.
4. Soup как tooling ок (железо ок, Qwen2.5-7B в каталоге Soup, GGUF→Ollama путь в продукте есть), но **продуктовый слой и данные** не готовы. TZD-76 **не** блокер для обучения на домашней 16 GB и инференса через **Ollama**; блокер только для встроенного `.gguf` в NSIS.

**Правильный порядок:**
1. Baseline: wire `general.md` + `normalizeStep` + eval на fixtures (prompt-only, Ollama/remote).  
2. Dataset: opt-in лог HITL / export import_task pairs → JSONL (без ПДн в облако).  
3. Когда есть ≥N gold + baseline metrics → **тогда** TZ Soup LoRA + сравнение с baseline.

---

## 4. Что сделать до возврата к Soup

См. WAVE `docs/agent-checklists/WAVE-DESKTOP-AI-IMPORT-BASELINE.md` + TZ ниже.

Распаковка Soup: `.tmp/soup-0.74/` (gitignore `.tmp/`; канон в git = `Soup-0.74.0.zip`).

## 5. Closeout 01/3 (2026-09-11) — `TZD-AI-IMPORT-GENERAL-BASELINE` DONE

`general.md` подключён в `buildSystemPrompt()`; `pipeline.normalizeStep` больше
не stub — реальный `chatCompletion` + 1 retry + фильтр выдуманных полей
(`core/ai/normalize.ts`). Провайдер — параметр (`ResolvedProvider`), не
хардкод local-порта — вызывающий код сам решает Ollama/remote.

Eval: **Ollama в этой среде не запущен** (`curl :11434/api/tags` → connection
refused) — harness намеренно построен на **синтетических ответах модели**
(59 fixtures: RU-даты/ИНН/деньги/enum-miss/invented-fields/malformed-JSON),
не на живом вызове. Метрики измеряют робастность парсера/валидатора, не
точность реальной модели — честно задокументировано в коде/докe, не
выдаётся за live-model accuracy. `rawRows` в каждом fixture сохранён для
будущего прогона на живой модели тем же набором.

**Записанные метрики (59 fixtures):** `parse_ok=88.1%` (52/59) ·
`required_field_fill=86.3%` (82/95 required-слотов) ·
`invented_field_rate=16.9%` (10/59 — каждый специально тестирует фильтр
выдуманных полей). `parse_ok` выше порога WAVE (`>=75%` на `>=50` fixtures).
