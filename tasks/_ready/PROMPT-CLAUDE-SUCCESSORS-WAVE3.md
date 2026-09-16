# PROMPT — Claude: Successors **волна 3** (цена/сумма → токены на холсте)

> Отдавать только после WAVE2_DONE. Copy-paste блок ниже.

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0 на main (continuous, НЕ .freebuff/worktrees).

=== UNATTENDED + THOROUGH ===
PO AFK. Не спрашивай «продолжать?» между TZ.
После КАЖДОГО TZ: ACCEPT + archive + commit + push + строка в docs/agent-checklists/WAVE-2026-09-13-SUCCESSORS.md + Checkpoint.
Секреты не печатать. Скорость ≠ критерий.
=== /UNATTENDED + THOROUGH ===

## Startup

1) how-to-connect-ai → GEMINI.md (agent_id: claude) → PROJECT-MEMORY → PO-CANON → PO-SHARED §2.
2) git fetch && merge origin/main. Ожидай WAVE2 tip (HEAD был 3c122f96 / backfill).
3) WAVE-2026-09-13-SUCCESSORS.md — current_wave=3; Checkpoint WAVE3 started.
4) _active пуст. Baseline: cd frontend-nx && pnpm exec nx build kppdf-web

## Очередь (строго)

3.1  tasks/_ready/TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM.md
     Аудит: docs/audits/2026-09-13-docstudio-table-price-sum.md
     Aliases listPrice→price; chip «+ Сумма»; heal labels Цена/Сумма; type-select lock для known keys.
     sum = price×qty. Modules без цены = 0 (не добавлять schema).

3.2  tasks/_ready/TZ-NX-DOCSTUDIO-TOKEN-EDITOR-CHIP.md
     Аудит: docs/audits/2026-09-13-docstudio-token-editor-chip.md
     textHtml + migratePlainTokensToNodes → чипы на холсте.
     Свойства: сегмент Токены|Значения; default=Токены; Значения display-only (не PATCH content).
     PDF/Просмотр без editor-chip краски. Не путать с chrome «Просмотр».

Между TZ: один Claim; _active чист перед следующим.
Оба TZ трогают studio + document-studio.page.md — только подряд, не параллель.

## Не брать

WAVE1/2 закрытое · SSH-REMAINDER · wipe/deploy · ISSUER 403-WARN (уже WARN) · чужой Cursor WIP

## Отчёт PO

Таблица 3.1–3.2 | SHA | PASS/FAIL | 1 строка. WAVE3_DONE. Новую волну не предлагай.
```
