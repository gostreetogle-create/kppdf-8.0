# WAVE: Desktop Excel Import Studio (READY)

> Аудит: `docs/audits/2026-08-10-desktop-excel-import-studio-audit.md`  
> Промпт: `tasks/_backlog/desktop/PROMPT-EXCEL-IMPORT-STUDIO.md`  
> Статус: **READY** — serial **TZD-36 → 37 → 38**

## Порядок

| # | TZ | Файл | DEPENDS |
|---|-----|------|---------|
| 1 | TZD-36 | `tasks/TZD-36-desktop-import-studio-shell.md` | — |
| 2 | TZD-37 | `tasks/TZD-37-excel-validation-hitl-studio.md` | 36 |
| 3 | TZD-38 | `tasks/TZD-38-spec-bom-composition-import.md` | 37 (+ TZD-31 желательно) |

## Правила

- Один агент на волну; mid-queue без «поехали».
- Commit+push на каждом DONE.
- **Не** параллелить 37/38 с WAVE-MCP-GAP (общий `desktop/mcp`).
- TZD-36 можно стартовать параллельно DICT-DEMO (разные trees).
- Не коммитить `desktop/mcp-runtime/**`.
- Deploy NO; после 38 — «готово предложить деплой» только если PO просит desktop ZIP отдельно.

## BAN

- Вторая SoT / local Mongo  
- Silent SoT write  
- Заказы/КП bulk  
- Переписывать Nest catalog schemas «под Excel»  
- EAV поля из воздуха  

## Acceptance волны

- Flat Excel → статусы строк → Отправить в SoT **после** подтверждённого **профиля сопоставления полей** (save/★ default; красные unfit).
- Дубли/коллизии видны до отправки; опц. AI map + AI row-check при живом MCP.
- Спецификация с уровнями → изделие/модули + composition lines через HITL (38).
