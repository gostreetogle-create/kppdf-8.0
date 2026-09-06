# Gemini peer — Desktop локальный чат / runner (2026-09-06)

Источник: ответ Gemini на `docs/peer/PROMPT-GEMINI-DESKTOP-AI-UX.md` промпт 2.  
PO сохранил в чат Cursor.

## Вердикт (принят Cursor)

**DA: спрятать локальный чат** за «Скоро», пока нет acceptance. MCP не трогать.  
Совпадает с аудитом honesty и жалобой PO на 0.5.7.

## Диагноз (сжато)

1. Sidecar/Node path в NSIS vs PATH на машине разработчика (ENOENT).
2. native `node-llama-cpp` / VC++ / папка models не создана.
3. Health бьёт в мёртвый порт (процесс упал / другой порт / health до load модели).

## Happy-path (целевой, не сейчас)

Создать models dir → нет gguf → одна кнопка скачать → автостарт helper → зелёный статус → чат.

## Acceptance DONE (без этого кнопки скачивания нельзя)

1. Runner стартует в **собранном** NSIS без падений node_modules/.node  
2. Видит .gguf без рестарта приложения  
3. Health 200 за ≤5 с после старта (модель готова, не просто HTTP up)  
4. 1 полный цикл request → stream → ответ в UI

## Следующие TZ

| ID | Суть |
|----|------|
| TZD-75 | Hide local chat + modern shell layout (Gemini design when arrives) + bump **0.5.8** + release-installer |
| TZD-76 | (позже) Real local helper per acceptance — только по слову PO |

Не делать: ещё «Перезапустить»; обещать чат в 0.5.8 без acceptance.
