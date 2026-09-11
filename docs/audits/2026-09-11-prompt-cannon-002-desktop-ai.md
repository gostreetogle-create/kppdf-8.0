# Анализ `prompt_cannon/002.txt` (PROMPT-CANNON-002)

**Дата:** 2026-09-11  
**Промпт:** `prompt_cannon/PROMPT-CANNON-002-desktop-ai-next.md`  
**Сверка с:** `docs/audits/2026-09-11-soup-sft-import-decision.md`

## Голоса

| Модель | TOP-1 | TZD-76 | Alt bet (§6) |
|--------|-------|--------|--------------|
| GPT-4o Mini ×3 | **a** | (ii) Ollama | deterministic mapping + profiles |
| Gemini 2.5 Flash ×N | **a** | (ii) | mapping+profiles / MCP power users |
| DeepSeek ×2 | **a** | (ii) | deterministic mapping (+ field profiles) |
| Claude Haiku | Failed | — | — |

**Единогласно:** следующий шаг = **(a) wire general.md + normalizeStep + eval**.  
**Единогласно:** TZD-76 = **(ii)** параллельно/опционально, не блокер.  
**Единогласно:** Soup **не** сейчас; anti-patterns = general SFT, cloud Excel, train без baseline.

## Типичный порядок (сводка)

1. **a** baseline  
2. **b** HITL→JSONL *или* **f** column-mapping на Ollama (Gemini/DeepSeek часто ставят **f** сразу после **a**)  
3. **d** TZD-76 позже  
4. **c** Soup / **e** MCP-SFT в хвосте  

Альтернатива «не ML-цепочка»: усилить **детерминированный mapping + профили** — побеждает, если AI-нормализация слабо даёт ROI цеху из 10 человек.

## Пороги Soup (разброс — взять медиану)

| Источник | parse_ok | fixtures | gold JSONL | delta vs baseline |
|----------|----------|----------|------------|-------------------|
| GPT / часть | ≥90% | 100 | ≥200 | format errors ≤5% |
| Gemini | ≥70% | 20–50 | ≥500 | >5–10% improvement needed |
| DeepSeek | ≥70–80% | 50–200 | ≥500 | _errors −15%+ |
| **Рекомендация kppdf** | **≥75%** | **≥50** | **≥300** opt-in local | **≥10%** fewer hard format fails |

## Качество vs 001

Промпт с FACTS сработал: почти нет выдуманных React-путей; все выбрали (ii) по TZD-76; появился полезный разброс по **f** vs **b** и по числам Soup.

Мелкий шум: GPT предлагает A/B suggestWithAi как «smallest experiment» вместо wire general.md — слабее Gemini/DeepSeek.

## Решение для проекта

**Не меняем WAVE.** Оставляем:
- `TZD-AI-IMPORT-GENERAL-BASELINE` → потом `TZD-AI-IMPORT-HITL-DATASET-LOG`
- Опциональный параллельный микро-TZ позже: Ollama для `suggestWithAi` без local port (сейчас AI-mapping завязан на скрытый runner) — **только если PO хочет UX импорта раньше row-normalize**

Soup / TZD-76 / MCP-SFT — PARK до гейтов выше.
