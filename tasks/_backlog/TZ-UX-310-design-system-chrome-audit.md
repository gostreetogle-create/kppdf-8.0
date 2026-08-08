═══════════════════════════════════════════════════════════════
TZ-UX-310: Аудит chrome drift (docs-only)
═══════════════════════════════════════════════════════════════

> Бывший черновик TZ-UX-303 — ID занят архивом (copy/IA). Новый номер: **310**.

STATUS: READY

РОЛЬ: Cursor / FE read-only → audit md

LAYER: 1

CONFLICT KEYS:
docs/audits/2026-08-09-design-system-chrome-drift.md;
docs/pages/ui-page-chrome.md;
docs/agent-checklists/TZ-UX-310.md;

## ЧТО ДЕЛАТЬ

1. Grep страниц без PiGroupWorkspace/PiPageChrome / text-5xl / самодельные крошки.
2. Таблица path → chrome → PASS/FAIL.
3. Successor TZ list только на FAIL.
4. НЕ кодить продукт.

## AC

- [ ] audit file; prioritized FAIL list
