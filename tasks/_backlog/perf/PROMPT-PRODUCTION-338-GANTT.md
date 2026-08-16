# PROMPT — Gantt perf (TZ-PRODUCTION-338)

Скопируй локальному агенту / Freebuff:

```text
Прочитай GEMINI.md + tasks/TZ-PRODUCTION-338-gantt-hydrate-parallel.md
+ docs/audits/2026-08-16-production-gantt-perf-audit.md.

Цель: /production Гант снова быстро показывает полосы без смены estimate-логики.

Сделай:
1) baseline Network (коротко в closeout);
2) parallel prefetch unique products/modules в ProductionReadFacade;
3) bootstrap: bars раньше thumbs (thumbs не блокируют);
4) tsc + focused jest; archive; commit по GIT-POLICY.

Не трогать: PATCH estimate, cascade UI, filters/status, backend batch API, deploy.
```
