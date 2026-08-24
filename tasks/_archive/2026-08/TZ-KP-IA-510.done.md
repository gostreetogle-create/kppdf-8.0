# TZ-KP-IA-510: КП rail IA — Money + Deadlines канон

> Архив: `tasks/_archive/2026-08/TZ-KP-IA-510.done.md`
> Исходная TZ: `tasks/TZ-KP-IA-510-rail-canon-money-deadlines.md`

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-24
closed_by: Claude (Codebuff/Buffy)
verification:
  - acceptance criteria: PASS
  - typecheck: N/A (docs-only)
  - tests: N/A (docs-only)
  - lint: N/A (docs-only)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

## Что сделано

Переписан канон правой рейла КП в трёх doc-файлах:

1. **`kp-workspace-rail-ia.md`**:
   - §1 Right rail: 5 секций (params/money/deadlines/table/terms), #4–8, без output
   - Баннер IA-510: «не откатывает 402, расширяет до 3L+5R»
   - §2 parity: money (CircleDollarSign) и deadlines (Clock) как новые строки
   - §3 Icon dedup: CircleDollarSign и Clock зарезервированы, Printer — только ribbon
   - §6 leftover: ожидаемые chrome-tool ids (8), `chrome-tool-output` не регистрируется
   - §7 Migration: запрет reuse CircleDollarSign/Clock

2. **`kp-workspace.page.md`**:
   - UI схема: Money/Deadlines добавлены, Output убран
   - Таблица секций: Параметры/Деньги/Сроки вместо «org, деньги, сроки»
   - Вывод: ribbon, не rail
   - Получатель: +сводка клиента
   - DraftService: money/наценка/НДС/скидка + deadlines/предоплата/дни

3. **`PAGE-TZ-INDEX.md`**:
   - Строка волны 510–512 обновлена: WAVE-KP-RAIL-BIND, 510 docs DONE
   - `/proposals/create`: IA 510–512 rails+bind
   - Updated: 2026-08-24

## Изменённые файлы

- docs/pages/kp-workspace-rail-ia.md
- docs/pages/kp-workspace.page.md
- docs/pages/PAGE-TZ-INDEX.md

## Не изменялось

- frontend/backend product code
- docs/pages/kp-workspace-geometry.md
- Ribbon print/PDF поведение

## known_limitation

- Код rails всё ещё на 3L+4R до TZ-KP-IA-511 — после 510 канон опережает код (норма).
- Invoice supplier→counterparty bag alias — вне волны (BIND leftover).