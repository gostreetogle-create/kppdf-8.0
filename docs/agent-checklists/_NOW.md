# NOW — оперативная доска агента (короткий срез)

> Правда для resume/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновляй оперативные секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-17T00:20:00+03:00
hygiene: swarm 369; warm deploy (PO VPN off)

## ACTIVE

- **TZ-SALES-369**
- Prompt: `tasks/PROMPT-TOMORROW-GANTT-THEN-DRAIN.md`

## NEXT (PO)

1. После роя: hard-refresh `/production` «По рабочим»
2. Warm deploy (WIPE=false) — PO разрешил, VPN off


## Queue hygiene (not live)

- **_park/** — не брать (AUTH-307, SALES-377, UTF8, passports, TZD-49, …)
- Аудит: `docs/audits/2026-08-16-tasks-hygiene-drain-audit.md`

## DONE / LANDED (recent)

## [2026-08-17] — TZ-SALES-369 DONE — KP PDF filename canon

- Archive: `tasks/_archive/2026-08/TZ-SALES-369.done.md`; lock `TZ-SALES-369-kp-pdf-filename.lock`; FE tsc + jest 5/5; BE jest 4/4. Deploy нет. `КП-{number}.pdf`; draft `КП-черновик-{shortId}`; shared FE/BE helpers.

## [2026-08-16] — TZD-39 DONE — Basic Auth + X-Access-Token coexist

- Archive: `tasks/_archive/2026-08/TZD-39.done.md`; lock `TZD-39-desktop-basic-auth-coexist.lock`; gates BE 7/7, FE 7/7, desktop 114/114 @ fd31ab5. Deploy/smoke deferred PO swarm warm.

## [2026-08-17] — TZ-PRODUCTION-353 DONE — unassigned banner + People CTA

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-353.done.md`; lock `TZ-PRODUCTION-353-gantt-unassigned-people-gate.lock`; FE tsc + jest gantt+cockpit **131/131**. Deploy нет. Banner + amber «Не назначен» row; bars stay on Gantt.

## [2026-08-16] — TZ-PRODUCTION-352 DONE — worker tint hash fallback

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-352.done.md`; lock `TZ-PRODUCTION-352-gantt-workers-tint-fallback.lock`; FE tsc + jest gantt **102/102**. Deploy нет. `resolveWorkTypeHue` for assigned worker summary when catalog accentHue null; unassigned hue null until 353.

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
