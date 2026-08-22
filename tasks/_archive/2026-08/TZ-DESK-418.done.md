# TZ-DESK-418: Удалить заказ со стола

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude

## Outcome

На `/desk` добавлено удаление заказа через общий `OrdersService.remove`:
- destructive-кнопка `data-test="desk-order-delete"` в каждой строке;
- click останавливает bubbling и не раскрывает заказ;
- подтверждение через `PiDialogService` + `AlertDialogComponent`;
- после успешного soft-delete показываются toast, reload списка и сброс раскрытия удалённого заказа.

Документация страницы и `PAGE-TZ-INDEX` синхронизированы.

## Verification

- acceptance criteria: PASS
- FE typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- focused Jest: PASS (25/25, `manager-desk.page.spec`)
- FE lint: PASS (exit 0; 18 pre-existing architecture warnings, 0 errors)
- browser live: N/A (known limitation TZ, not blocking)
- checklist: ADDED
- page docs: UPDATED
- PAGE-TZ-INDEX: UPDATED
- status synchronization: PENDING SHA closeout
- review diff: PASS
- deploy: NOT RUN

## Executor report

Чужой dirty WIP в checkout не включался. Изменены только conflict keys TZ-DESK-418 и PAGE-TZ-INDEX; backend/API, tray, `.github/` и deploy не трогались.
