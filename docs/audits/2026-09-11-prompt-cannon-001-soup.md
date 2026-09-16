# Анализ `prompt_cannon/001.txt` vs наш аудит Soup

**Дата:** 2026-09-11  
**Источник:** Smart Poll / multi-model ответы на тот же промпт «дообучать ли через Soup».  
**Эталон фактов:** `docs/audits/2026-09-11-soup-sft-import-decision.md` + живой код (не архив в промпте).

## Кто отвечал

| # | Модель | Вердикт | Качество |
|---|--------|---------|----------|
| 1 | GPT-4o Mini | «надо проверить» без проверки | Мета-инструкция, **не решение** |
| 2 | Gemini 2.5 Flash | **Рано** + TZ baseline/HITL | Сильный по направлению; ошибки в деталях |
| 3 | Claude 3.5 Haiku | Failed | — |
| 4 | GPT-4o Mini #2 | Снова «проверьте сами» | Пусто |
| 5 | Gemini Flash #3 | **Рано**, TZD-76 = главный блокер | Переоценён TZD-76 |
| 6 | Claude Haiku #2 | Failed? / мало | — |
| 7 | GPT-4o Mini #3 | слабый | — |
| 8 | DeepSeek Chat #1 | **Рано**, 200–300 примеров | Ок направление; путает статусы TZ |
| 9 | Gemini Flash (ещё) | **Рано**, TZD-76 critical | То же |
| 10 | DeepSeek #2 | **Рано**, 300–500, выдумал React-пути | Опасные галлюцинации путей |

## Консенсус толпы (верно)

1. **Не стартовать Soup train сейчас.**  
2. Сначала **baseline `general.md` + измерение** на generic Qwen.  
3. **Нет готового датасета** raw→confirmed JSON; HITL надо инструментировать.  
4. Синтетика / тесты = десятки, не сотни gold.

Совпадает с нашим WAVE `WAVE-DESKTOP-AI-IMPORT-BASELINE`.

## Где толпа ошиблась / хуже нашего аудита

| Утверждение в 001 | Факт в репо |
|-------------------|-------------|
| TZD-76 **обязательный** блокер до любого SFT | **Нет.** Train на 16 GB + инференс через **Ollama** уже в `AI-PROVIDERS.md`. TZD-76 только для встроенного node-llama/NSIS. |
| TZD-75 «ещё открыт» (DeepSeek) | TZD-75 **DONE** (archive); runner UI скрыт. |
| `data/` пуста | Есть `yougile-import` / `from-kp3` — но это **не** SFT-пары. |
| mutation-journal уже логирует raw+JSON (DeepSeek #2 частично) | Schema: `payload` / before/after — **без** сырого файла. |
| Пути `ImportConfirmation.tsx`, `src/server/api/...` | **Галлюцинация** (стек Desktop = Svelte/Tauri + Nest `backend/src/modules/mutation-journal`). |
| Цель = «встроить GGUF в чат» как must | Рабочий путь пользователя сейчас: Ollama/remote + MCP; SFT можно валидировать без TZD-76. |
| Живой импорт = сценарий general.md | Сейчас AI = **column mapping** (`suggestWithAi`); `normalizeStep` stub. Толпа почти не разделяет. |

## Что взять из 001

- Формулировку «рано → две TZ: baseline + dataset log» — уже оформлено у нас.  
- Идею метрик baseline до LoRA.  
- Оценку «сотни примеров» как порог возврата к Soup.

## Что отбросить

- «Сначала обязательно TZD-76».  
- Выдуманные FE-пути и «закрыть TZD-75».  
- GPT-4o Mini как источник решений (не читал код).

## Итог для PO

Cannon **согласен с «рано»**. Наш аудит **строже и точнее** по железу/раннеру и по реальному импорт-пайплайну. План не меняем: baseline TZ на диске, Soup PARK; DocStudio/NX в приоритете очереди Claude.
