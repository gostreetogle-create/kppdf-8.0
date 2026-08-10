# TZ-SALES-347 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-347.md` удалён после closeout.
> Conflict keys: proposal-create.page.ts/.spec.ts, pi-proposals.service.ts, proposals-create docs

## Claim slot

- agent_id: `agent-d2515d7a53`
- claimed_at: `2026-08-11`
- workspace: `D:\\kppdf-8.0` canonical `main`
- team_room_claim: `unavailable (Unknown task; claim attempted)`

## Acceptance

- [x] Верхняя строка студии показывает RU badge статуса и выбор только разрешённого следующего перехода; accepted/closed сохраняет сильный lock 336.
- [x] «Сохранить версию» вызывает существующий `freeze`; «Версии (N)» загружает список, а snapshot открывается read-only и возвращается к текущему листу без PATCH/autosave.
- [x] «Создать заказ» показывается только для accepted КП, использует backend convert-to-order и после успеха переходит на `/orders/:id`.
- [x] «Копировать КП» вызывает existing duplicate и открывает копию в Create КП.
- [x] FE tsc PASS; `pnpm test -- proposal-create --runInBand`: 33/33 PASS; Angular development build PASS.
- [x] Prettier/ESLint/diff-check PASS.
- [x] Browser-equivalent self-verify PASS по Angular DOM/component suite; live authenticated browser smoke недоступен без backend data stack.

## Closeout

- [x] Archive marker created.
- [x] Lock created.
- [x] Active marker removed.
- [x] Commit + push complete.
