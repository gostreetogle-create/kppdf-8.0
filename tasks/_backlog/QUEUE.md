# Очередь (тонкая) — после гигиены 2026-08-16

**Аудит:** [`docs/audits/2026-08-16-tasks-hygiene-drain-audit.md`](../../docs/audits/2026-08-16-tasks-hygiene-drain-audit.md)  
**Слить очередь:** [`tasks/PROMPT-SEQUENTIAL-DRAIN-NOW.md`](../PROMPT-SEQUENTIAL-DRAIN-NOW.md)  
**Обрыв:** [`tasks/PROMPT-RESUME-AFTER-DROP.md`](../PROMPT-RESUME-AFTER-DROP.md)  
**След. чат:** **TZ-MIG-304** · `_backlog/migrate-kp3/TZ-MIG-304-*.md`

## Живое (порядок)

| # | ID | Где | Класс | Кому |
|---|-----|-----|--------|------|
| 1 | **TZ-MIG-304** | `_backlog/migrate-kp3/` | email→Person | Freebuff · 1 чат |
| 2 | **TZ-MIG-303** | `_backlog/migrate-kp3/` | attach photos | после 304 + TZD-47 |

## Закрыто в рое (сегодня)

- **TZ-MIG-302** DONE (archive-only) — KP3 load 2026-08-12; 699 products; REST when MCP down; no re-load
- **TZ-MIG-306** DONE @ `bceb1762` — categoryId `$in` filter; live verify BLOCKED (API down)
- **TZD-47** DONE @ `d158c112` — HITL photo upload; live MCP был offline; BE не трогал
- **TZD-56** DONE @ `07593970` — NSIS `ai-runner.mjs` + llama CPU; bump 0.5.6; deploy НЕ
- **TZ-UX-371** DONE (archive на диске)
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
