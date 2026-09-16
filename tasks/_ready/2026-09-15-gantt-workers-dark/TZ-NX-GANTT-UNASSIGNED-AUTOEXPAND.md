# TZ-NX-GANTT-UNASSIGNED-AUTOEXPAND: auto-expand «Не назначен» + banner CTA

> **SIZE:** S · **PACK:** WAVE-GANTT-DARK-2026-09-15  
> **PAGES:** `/production`  
> **PAGE_DOCS:** `docs/pages/production-cockpit.page.md`  
> **LAYER:** 3 · **IMPLICIT CONFLICT:** `nx build kppdf-web`  
> **CONFLICT KEYS:** `frontend-nx/libs/features/src/lib/production/production-cockpit.context.ts`; `production-cockpit.facade.ts`; `ui/gantt-bars.component.ts`; `gantt-bars.facade.ts`; `*.spec.ts` рядом  
> **ROLE:** executor (`claude` \| `freebuff`) · `agent_id` в Claim

## BUILD INTEGRITY

IMPLICIT CONFLICT: `nx build kppdf-web`  
Baseline до CLAIM + `nx build kppdf-web` **последним** перед archive.  
Параллель: STOP если другой TZ с `kppdf-web/src/**` в `_active`.

## Domain preflight

Проверено: `docs/audits/2026-09-15-gantt-workers-unassigned-void.md`; `gantt-bar.model.ts` `UNASSIGNED_WORKER_LABEL` / `buildWorkerTreeBars`; `production-cockpit.context.ts` `expandedWorkerIds = signal(new Set())`; banner `gantt-unassigned-banner` → `/registries/workers`.  
Люди = **Worker** (навыки `workTypeIds`), не User.  
N/A: schema / Counterparty.

### Сбои оператора
1. Все WT без навыка → одна свёрнутая строка «Не назначен» — не видно 4 видов работ.  
2. Баннер зовёт в «Люди», не говорит раскрыть группу.  
3. Оператор думает, что Гант пустой/сломан.

## ИСХОДНОЕ

- `buildWorkerTreeBars(..., expandedWorkerIds)` при пустом Set отдаёт только worker-summary.  
- Summary span = union дат → один бар «38д».  
- Banner: «назначьте в Люди» без «раскройте».

## ЧТО ДЕЛАТЬ

### 1. Auto-expand unassigned
При `groupByWorkers === true` и наличии unassigned work bars:  
включить `UNASSIGNED_WORKER_LABEL` в `expandedWorkerIds` (один раз при входе в режим / при появлении unassigned), чтобы сразу были видны module/WT rows.  
Не разворачивать все именованные рабочие без клика.

### 2. Banner copy
Дополнить статус (RU), смысл: раскрыта группа или «смотрите „Не назначен“ ниже» + ссылка Люди.  
Не удлинять >2 строк. `data-test` баннера сохранить.

### 3. Specs
- Workers mode + unassigned bars → tree содержит не только `worker-summary:Не назначен`, но и child work/module rows без ручного toggle.  
- Named worker groups остаются collapsed by default.

## НЕ
- Менять skill→workerLabel join / BE workers API  
- Auto-expand всех workers  
- Deploy / wipe  
- Трогать light/dark токены wash (следующая TZ)

## AC
1. Dark или light, «По рабочим», все WT unassigned → после load видны виды работ под «Не назначен» без клика.  
2. Баннер читаем и указывает Люди + контекст группы.  
3. Focused specs PASS; `nx build kppdf-web` LAST exit 0.

### Gates
```bash
cd frontend-nx && pnpm exec nx test features --testPathPattern="gantt-workers-view|gantt-bars|production-cockpit" --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```

### known_limitation
Назначение исполнителя на баре в режиме workers по-прежнему read-only (G6) — successor вне этой TZ.
