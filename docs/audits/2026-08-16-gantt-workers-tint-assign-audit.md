# Audit — Gantt «По рабочим»: tint + назначение (2026-08-16)

## Verdict

351 покрасил **только** тех рабочих, у чьих WT в каталоге задан `accentHue`.  
Остальные WT с `accentHue: null` на барах → `dominantWorkTypeAccentHue` → `null` → нет wash/chip/barFill.  
При этом **листья** WT на таймлайне красятся всегда: `workTypeOklch(workTypeId, …, null)` хеширует id.

PO: всё, что на Ганте, **должно** быть привязано к людям. Сейчас «—» → группа «Не назначен» без громкого сигнала «иди назначь в Люди».

## Root cause (tint)

| Слой | Факт |
|------|------|
| Catalog | `WorkType.accentHue` optional; многие null |
| Facade | `accentHue: catalog?.accentHue ?? null` |
| 351 dominant | `return ranked[0]?.accentHue ?? null` — **теряет** hash-fallback |
| UI | tint только если `accentHue != null` |

## Unassigned

- `applyWorkerLabels`: нет People×WT → `workerLabel: '—'` → `UNASSIGNED_WORKER_LABEL`.
- Группа есть, но выглядит как обычный worker; нет CTA на `/people` / `/work-types`.
- Канон PO: gap обязателен к закрытию оператором (не прятать работу с Ганта).

## Tomorrow split

| ID | Что | Кому |
|----|-----|------|
| **TZ-PRODUCTION-352** | Tint fallback: dominant всегда даёт hue (catalog **или** hash id, как leaf bars) | Freebuff |
| **TZ-PRODUCTION-353** | Баннер + визуал «Не назначен» + список WT без людей + ссылка Люди | Freebuff |
| Drain | SALES-369… после 352–353 | Freebuff |
| Cursor | Только если PO захочет hard-block hydrate без людей (сейчас **не** в scope) | — |

## Не делать завтра «заодно»

- Переписать fan-out comma multi-person → N строк на человека (отдельный successor).
- Wipe / deploy без «кати».
- `_park/**`.
