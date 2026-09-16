# PROMPT — Freebuff: B9 Registries page (финал волны)

Скопируй блок ниже целиком.

---

```
UNATTENDED: не спрашивай «продолжать?». GEMINI.md + kppdf-executor-loop.
agent_id: freebuff. Claim ДО кода. Continuous 2 TZ → archive → STOP (B9 конец).

Сверка: _NOW.md + tasks/_active/ — пусто до claim.

VERIFY PASS до тебя:
- COUNTERPARTY hub: 4bd786b4 → 06e7fcb9
- REGISTRY-DETAIL move: d83d0cd2 (panel уже в @kppdf/features/registry-forms)
- types: @kppdf/features/registries-platform

Твоя очередь (финал B9):
1) tasks/_ready/2026-09-15-decomp-b9-registry-hubs-lists/TZ-NX-REGISTRIES-PAGE-FACADE.md
2) tasks/_ready/2026-09-15-decomp-b9-registry-hubs-lists/TZ-NX-REGISTRIES-PAGE-TO-FEATURES.md

WAVE: tasks/_ready/2026-09-15-decomp-b9-registry-hubs-lists/WAVE-MAP.md
Правила: Signals Facade, providers на page (не root), no behavior change,
не тащи весь data/*.registry.ts — только page facade.
nx build kppdf-web LAST.

Не трогай counterparties/** · studio-list · order-hub.

После #2: archive + краткий отчёт SHA. Дальше без нового промпта — IDLE.

PARK: Deploy/Wipe/SSH.
```
