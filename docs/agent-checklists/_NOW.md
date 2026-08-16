# NOW — оперативная доска агента (короткий срез)

> Правда для resume/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновляй оперативные секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-17T00:05:00+03:00
hygiene: PRODUCTION-351 DONE; SALES-369 drain next

## ACTIVE

- _(idle)_ — queue empty after 351
- **Drain:** SALES-369… (`PROMPT-FREEBUFF-TASKS-DRAIN`) — next when PO assigns

## NEXT (PO paste prompt)

1. Hard-refresh `/production` → «По рабочим» — verify worker FIO tint + ▸ modules
2. Freebuff drain / Deploy — по слову PO


## Queue hygiene (not live)

- **_park/** — не брать (AUTH-307, SALES-377, UTF8, passports, TZD-49, …)
- Аудит: `docs/audits/2026-08-16-tasks-hygiene-drain-audit.md`

## DONE / LANDED (recent)

## [2026-08-17] — TZ-PRODUCTION-351 DONE — worker FIO WT tint

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-351.done.md`; lock `TZ-PRODUCTION-351-gantt-workers-fio-wt-tint.lock`; FE tsc + jest gantt **98/98**. Deploy нет. Dominant WT accentHue on worker summary; FIO wash + chip + timeline tint; ▸→modules (344 kept); orders milk ladder unchanged.

## [2026-08-16] — TZ-COMBINE-415 DONE — readable order № + text-ink

- Archive: `tasks/_archive/2026-08/TZ-COMBINE-415.done.md`; lock `TZ-COMBINE-415-combine-readable-order-labels.lock`; FE tsc + jest dashboard.page **28/28**. Deploy нет. No pi-tech-label; mono text-ink badge; name+stage titles text-ink; placeholder opacity scoped to mini-kanban.

## [2026-08-16] — TZ-COMBINE-413 DONE — DnD no-jump + module dialog

- Archive: `tasks/_archive/2026-08/TZ-COMBINE-413.done.md`; lock `TZ-COMBINE-413-combine-dnd-no-jump.lock`; FE tsc + jest dashboard.page + dashboard-dialog **33/33**. Deploy нет. Solid preview; placeholder opacity 0; openModuleEdit stay on combine.

## [2026-08-16] — TZ-COMBINE-414 DONE — name/row expand; pencil-only edit

- Archive: `tasks/_archive/2026-08/TZ-COMBINE-414.done.md`; lock `TZ-COMBINE-414-combine-name-expands-pencil-edits.lock`; FE tsc + jest dashboard.page **26/26**. Deploy нет. Name/qty/indicators→expand; pencil→editProduct; fuse 412 kept.

## [2026-08-16] — TZ-COMBINE-412 DONE — fuse rows + name edit

- Archive: `tasks/_archive/2026-08/TZ-COMBINE-412.done.md`; lock `TZ-COMBINE-412-combine-fuse-rows-name-edit.lock`; FE tsc + jest dashboard.page **26/26**. Deploy нет. Fuse same-order; mt-3 boundary; name→edit; module pencil→dialog (413).
