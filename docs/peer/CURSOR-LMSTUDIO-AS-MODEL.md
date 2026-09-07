# Cursor ↔ LM Studio (Gemma) — как дать задание и оценить

PO хочет: Cursor ставит задачу → Gemma в LM Studio выполняет в контексте kppdf → смотрим качество.

## Важно

| Не путать | Роль |
|-----------|------|
| `.cursor/mcp.json` | **Инструменты** (Claude Code, kppdf MCP) — не выбор модели чата |
| Settings → Models | **Какая модель** отвечает в Cursor Chat/Agent |
| LM Studio `:1234` | Локальная Gemma |

Подключить LM Studio «как MCP в mcp.json» **не** сделает Cursor агентом на Gemma. Нужен **Override OpenAI Base URL** (или ручной peer-режим ниже).

Ограничение Cursor (официально): запросы к кастомному OpenAI endpoint идут **через облако Cursor**, поэтому голый `http://127.0.0.1:1234` часто **не работает**. Нужен публичный HTTPS-туннель (ngrok / cloudflared) на порт LM Studio.

---

## Вариант A — Gemma как модель внутри Cursor (полный BYOK)

1. LM Studio: модель `google/gemma-4-12b-qat` → Local Server **Start** (порт 1234, CORS on).
2. Туннель (пример):
   ```bash
   ngrok http 1234
   ```
   Скопируй `https://….ngrok-free.app`.
3. Cursor → **Settings → Models**:
   - Enable OpenAI API Key → ключ любой placeholder, напр. `lm-studio`
   - **Override OpenAI Base URL** = `https://….ngrok-free.app/v1` (обязательно `/v1`)
   - **Add custom model** = точное id из LM Studio: `google/gemma-4-12b-qat`
4. В чате Cursor выбери эту модель → дай задание по репо.
5. Для ERP-tools дополнительно: Desktop MCP Запущен + блок `kppdf` в mcp.json (отдельно от модели).

Минусы: туннель светит API в интернет; Gemma 12B слабее Composer на больших TZ; Agent-режим Cursor может требовать моделей с tool-calling лучше, чем у Gemma.

---

## Вариант B — без туннеля (рекомендуем для честного теста качества)

Cursor (Composer) **не** меняет модель. Схема как с Gemini peer:

1. Cursor пишет **короткий промпт-задание** + пути файлов (TZ / баг / вопрос по supply).
2. Ты вставляешь в **LM Studio Chat** (Gemma).
3. Ответ кидаешь Cursor → оценка «годится / нет / что не так».

Плюс: ничего не торчим наружу; честное сравнение «Gemma сама vs Cursor».  
Минус: не авто-Agent в Cursor.

Шаблон задания для LM Studio: `docs/peer/PROMPT-LMSTUDIO-GEMMA-KPPDF-TASK.md`

---

## Что выбрать

- Хочешь **прямо в Cursor Chat выбрать Gemma** → Вариант A (туннель).  
- Хочешь **быстро и безопасно проверить ум** → Вариант B.

Не клади curl HuggingFace и куски shell в `mcp.json`.
