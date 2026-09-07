# Cursor mcp.json — что куда (не путать с curl LM Studio)

## Три разные вещи

| Что | Где | Зачем |
|-----|-----|--------|
| **Cursor MCP** | `.cursor/mcp.json` | Cursor ↔ Claude Code / kppdf tools |
| **LM Studio + Gemma** | `localhost:1234` | Локальная модель |
| **KPPDF Desktop MCP** | Desktop «ИИ» → порт `/mcp` | ERP tools (заказы, склад…) |

Curl с `huggingface` / `model_search` — **не** наш ERP. Для теста проекта нужен сервер **`kppdf`**, не HF.

## Починка

В `mcp.json` нельзя вставлять curl — только JSON. Иначе Cursor MCP ломается.

Сейчас файл снова чистый: только `claude_code`.

## Добавить kppdf в Cursor (когда Desktop MCP Запущен)

1. Desktop paired → MCP Запущен → **Скопировать mcp.json**.
2. Вставь **рядом** с `claude_code`, примерно так (порт и Bearer — **свои** из карточки):

```json
{
  "mcpServers": {
    "claude_code": {
      "command": "C:\\Users\\User\\.local\\bin\\claude.exe",
      "args": ["mcp", "serve"]
    },
    "kppdf": {
      "url": "http://127.0.0.1:PORT/mcp",
      "headers": {
        "Authorization": "Bearer kppd_…"
      }
    }
  }
}
```

3. Reload MCP в Cursor.  
4. **Не коммить** Bearer в git.

Проверка: Desktop `GET http://127.0.0.1:PORT/healthz` → ok.

## Тест Gemma отдельно

Gemma тестируй в **LM Studio**: туда же вставь тот же фрагмент `kppdf` (не в `.cursor/mcp.json` обязательно).  
См. `docs/peer/TEST-GEMMA-LMSTUDIO-KPPDF-MCP.md`.
