# PROMPT — Claude continuous — DECOMP B2 (Supply → Warehouse)

UNATTENDED. executor claude. D:\kppdf-8.0.
Только после B1 DONE (или пустой _active + явный старт PO).

SoT: tasks/_ready/2026-09-14-decomp-b2-supply-warehouse/WAVE-MAP.md
Tracker: docs/agent-checklists/WAVE-DECOMP-B2-SUPPLY-WAREHOUSE.md

Очередь: S1 SUPPLY-PAGE-FACADE → S2 SUPPLY-REQUESTS-FACADE → S3 SUPPLY-TO-FEATURES → W1 WAREHOUSE-PAGES-FACADE → W2 WAREHOUSE-TO-FEATURES

Ритуал: claim → code (no stock/status behavior change) → gates (tsc + testPathPattern supply|warehouse + nx build LAST) → archive → next.

Конец B2: STOP или B3 по batch README.
