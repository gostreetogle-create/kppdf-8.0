# LEDGER-08 — Desktop / MCP
date: 2026-08-16T17:10:00+03:00
agent: Buffy (freebuff)

## Score (0–100)
overall: 90
subscores:
  evidence_quality: 91
  sync_code_docs: 91
  risk_holes: 87

## What I opened (paths)
- desktop/docs/MCP.md — весь контур: envelope, propose→confirm, userOk gates, commercial/product/BOM/stock/doc tools, Security
- tasks/_archive/2026-08/TZD-48.done.md — блокеры 0.5.3, SoT-честность, verification
- tasks/_backlog/desktop/TZD-49-desktop-import-studio-hitl-followups.md — STATUS: PARK, DEP TZD-48
- docs/PO-CANON.md — «Desktop/MCP — управляемый импорт с проверкой человеком, не автономная публикация»

## PASS evidence
- **HITL повсюду:** propose→confirm через mutation journal (TZD-13/18), `userOk:true` обязателен для gated-мутаций (`quotation_set_status`, `convert_to_*`, `order_ship` — иначе toolFail, 0 write); Variant C protocol «ждём ok»; `apply_plan` без userOk → error 0 proposes; doc-constructor — только draft (`isActive=false`, никогда `/set-default`); cleanup — dryRun + userOk.
- **TZD-49 в park честно:** файл в tasks/_backlog/desktop/ с явным `STATUS: PARK`, зависимость «TZD-48 DONE», AC на снятие. Не выдаётся за live.
- **Нет «автопубликации каталога»:** материалы — только журнал; product/module/counterparty в Desktop Import Studio пишут SoT **только** явным действием менеджера (TZD-48 Policy A: честная кнопка «Записать в каталог» + confirm; `finalizeInboxFileIfDone` не двигает файл при полном фейле); MCP.md фиксирует «пишет SoT сразу» для counterparty/site с предупреждением; PO-CANON «не автономная публикация». Каталог-материалы нигде не публикуются молча.
- **TZD-48 closeout:** 10 блокеров закрыты, gates PASS (desktop tsc, svelte-check 0/0, 46 desktop tests, 12 BE jest), Cursor PASS, commit b03ecc22 → main, deploy NOT RUN.
- **Gate:** `cd desktop && npx tsc --noEmit` → PASS (EXIT 0).

## FINDINGS
| id | sev | area | repro/proof | action |
|----|-----|------|-------------|--------|
| F-01 | P3 | MCP.md | Строка «TZD-18 / TZD-19 PARK — batch scale / graph integrity» противоречит тем же записям «✅ DONE» выше (18/19 закрыты 2026-08-08) | **FIXED** — строка удалена (docs-only, 1 файл, не чужой WIP) |
| F-02 | P3 | MCP.md | Пример healthz: `toolCount: 93`, ниже «актуально 81» — устаревшие числа (реальное значение видно только с запущенным host) | accept / UNKNOWN (проверить при живом MCP) |

## TZ drafted (if any)
- Нет

## Confidence note for Cursor
- Desktop/MCP write-контур соблюдает propose→confirm/HITL; явные SoT-write (counterparty/site/studio non-material) документированы и user-confirmed — это осознанный Policy A, а не «автопубликация».
- Не проверял: живой MCP host (нужен pairing + запущенный десктоп); toolCount фактический (F-02 UNKNOWN).
- TZD-49 — следующий шаг к единому journal write-path, но корректно в PARK.
