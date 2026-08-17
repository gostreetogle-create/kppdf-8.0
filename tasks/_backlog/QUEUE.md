# Очередь (тонкая) — после гигиены 2026-08-16

**Аудит:** [`docs/audits/2026-08-16-tasks-hygiene-drain-audit.md`](../../docs/audits/2026-08-16-tasks-hygiene-drain-audit.md)  
**Слить очередь:** [`tasks/PROMPT-SEQUENTIAL-DRAIN-NOW.md`](../PROMPT-SEQUENTIAL-DRAIN-NOW.md)  
**Обрыв:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

## Живое (порядок)

| # | ID | Где | Класс | Кому |
|---|-----|-----|--------|------|
| 0 | **TZ-UX-371** | archive | FE orders expand + dark | DONE (unpushed WIP may remain) |
| 1 | **TZD-56** | archive | Desktop AI NSIS bundle | DONE 0.5.6 |
| 2 | **TZD-47** | `_backlog/desktop/` | MCP tool | Freebuff |
| 3 | **TZ-MIG-302→306→304→303** | `_backlog/migrate-kp3/` | data wave (MCP) | Freebuff |

## Закрыто в рое (сегодня)

- **TZD-56** DONE — NSIS `ai-runner.mjs` + llama CPU; bump 0.5.6; deploy НЕ
- **TZ-PRODUCTION-353** DONE @ `61dd144e` — unassigned banner + amber «Не назначен»
- **TZ-PRODUCTION-352** DONE @ `eccc1d6b` — worker tint hash fallback
- **TZ-SALES-369** DONE @ `8898a13e` — КП PDF filename
- **TZD-39** DONE archive-only @ `fd31ab5`

Промпт утра: [`tasks/PROMPT-TOMORROW-GANTT-THEN-DRAIN.md`](../PROMPT-TOMORROW-GANTT-THEN-DRAIN.md)  
Аудит: [`docs/audits/2026-08-16-gantt-workers-tint-assign-audit.md`](../../docs/audits/2026-08-16-gantt-workers-tint-assign-audit.md)

## Закрыто в этой волне

- **TZ-COMBINE-409…415** — product-row combine; DnD + module dialog; readable labels (`140440eb`)

## Не брать без PO

`tasks/_park/**` — AUTH-307, SALES-377, UTF8, passports, TZD-49, z-series, …

## Deploy

Только слово PO **«кати»** + VPN off. Wipe — отдельное русское подтверждение.
