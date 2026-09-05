# WAVE — Gantt job assignment (G13–G14)

Status: **READY for Claude** · 2026-09-05
Audit: `docs/audits/2026-09-05-gantt-worker-assignment-audit.md`
G11 chip: CANCELLED

## Chain

- [x] **G14-BE** — schema + PATCH · SHA `73b1a09b`
- [x] **G14-FE** — Freebuff · FE assignment panel, override labels, and worker links · SHA `b7846193`
- [x] **G13** — deep-link `/registries/workers` (covered by G14-FE work-detail/banner links; no separate TZ archive because source TZ is superseded)

## Parallelism

| Агент | Сейчас |
|-------|--------|
| Freebuff | G10→Registries→WAVE-S→**G14-FE** (`PROMPT-FREEBUFF-SLOT-A-GANTT-REGISTRIES.md`) |
| Claude | **Deals** параллельно (`PROMPT-CLAUDE-SLOT-B-DEALS.md`) — не production |

G14-BE DONE `73b1a09b`. G13 → deep-link реестр workers после R2 (в слоте A).

## Hard rules

Один write-path поручения = Order overrides. Skills = `Worker.workTypeIds` (не путать).
Пустой override → «Не назначен» на Ганте.
