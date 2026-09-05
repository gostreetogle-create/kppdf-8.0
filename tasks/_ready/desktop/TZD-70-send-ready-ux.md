═══════════════════════════════════════════════════════════════
TZD-70: Desktop — кнопка «Записать» только когда готово (green UX)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Desktop UI (`App.svelte` + CSS).

ЗАВИСИМОСТИ: TZD-69 DONE (или 68 если 69 parallel blocked — минимум после появления validation panel).

LAYER: 3
**SIZE:** S
**PACK:** WAVE-DESKTOP-EXCEL-NX-ALIGN

CONFLICT KEYS: `desktop/src/App.svelte` ; `docs/agent-checklists/TZD-70.md`

STATUS: READY

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

Кнопка «Отправить N строк в базу ERP» (`btn--primary`):
`disabled={mappingBusy || sendableRowsCount === 0}` —
активна даже если в таблице есть `invalid` (отправляются только ok_*, но UX «всё зелёное» нет).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Derived: `hasBlockingInvalid` = любой validated status `invalid` (и опционально `needs_review` как блок — **да, блокировать** needs_review тоже, пока не разобраны).
2. `canCommit = sendableRowsCount > 0 && !hasBlockingInvalid && !mappingBusy`.
3. Кнопка: `disabled={!canCommit}`; класс success/green когда `canCommit` (не только коричневый primary).
4. Баннер над кнопкой:
   - green: «Готово к загрузке: N строк»
   - red: «Исправьте ошибки (M) / строки на проверку (K) — запись недоступна»
5. Тест или минимальный unit на derived logic если вынесете в `.ts`; иначе characterization в существующем multi-import flow.

═══════════════════════════════════════════════════════════════
НЕ
═══════════════════════════════════════════════════════════════

- Менять правила какие статусы уходят в send (по-прежнему только ok_new/ok_update)
- frontend-nx

AC:
- [ ] При invalid>0 кнопка disabled даже если sendable>0
- [ ] При только ok_* — enabled + зелёный акцент
- [ ] duplicate alone не блокирует commit (они и так не в sendable)

Финализация: archive 2026-09.
