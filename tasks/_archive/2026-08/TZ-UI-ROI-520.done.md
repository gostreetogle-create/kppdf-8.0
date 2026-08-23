═══════════════════════════════════════════════════════════════
TZ-UI-ROI-520: Keyboard-only QA checklist (PO + agent)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Docs / QA scribe (код продукта НЕ трогать)
ЗАВИСИМОСТИ: UI-WR волна желательна, но не блокер (можно после 509 на desk)
LAYER: 1 (docs)
CONFLICT KEYS: docs/qa/keyboard-only-pass.md; docs/audits/2026-08-23-ui-war-room-program.md

PAGES: /desk ; /commercial/proposals (create/edit) ; /products (или modules)
PAGE_DOCS: manager-desk.page.md

Проверено: PO-CANON ROI keyboard-only; war-room Post-WR; нет CanDeactivate/dirty-guard
  на flyout (Claude 2026-08-23 analysis).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

PO ловит 90% a11y на показе правилом «отложи мышь». Сейчас нет единого чеклиста
в репо — стыд уходит в чат и теряется.

═══════════════════════════════════════════════════════════════
ЧТО СДЕЛАНО
═══════════════════════════════════════════════════════════════

ШАГ 1 — Создан `docs/qa/keyboard-only-pass.md`:
  - Правило: только Tab / Shift+Tab / Enter / Space / Esc (мышь запрещена).
  - Три сценария (короткие шаги + колонка «PASS/FAIL + стыд»):
    A. `/desk`: открыть строку → flyout/панель → поля → Esc → фокус куда?
    B. КП create: открыть flyout/диалог состава или свойств → Tab цикл → Esc.
    C. Каталог: фильтр или form-dialog → закрытие Esc/outside.
  - Итог: список FAIL → ссылки на successor TZ (не чинить в этом TZ);
    зафиксирован известный дефект (desk flyout без CanDeactivate/dirty-guard →
    successor `TZ-UI-ROI-523`), остальное — заполнить по факту PO-прогона.

ШАГ 2 — В `docs/audits/2026-08-23-ui-war-room-program.md`, секция «Post-WR ROI»,
  пункт 1 дополнен строкой: «Чеклист: `docs/qa/keyboard-only-pass.md`.»

ШАГ 3 — Proof: файл существует по пути `docs/qa/keyboard-only-pass.md`;
  в конце файла — «PO run: pending».

═══════════════════════════════════════════════════════════════
НЕ (соблюдено)
═══════════════════════════════════════════════════════════════

- frontend/** не трогался.
- Playwright e2e не писался.
- WebSocket / dirty-close не в scope (это ROI-523, только упомянут как ссылка).

═══════════════════════════════════════════════════════════════
Proof
═══════════════════════════════════════════════════════════════

- Файл: `docs/qa/keyboard-only-pass.md` — существует, 3 сценария + FAIL-список.
- Ссылка из war-room: `docs/audits/2026-08-23-ui-war-room-program.md` строка
  «Post-WR ROI» пункт 1.
- PO run: pending (первый реальный прогон ещё не выполнен).
- `git diff --check` на файлы этого TZ (новые + вставленная строка в war-room
  doc) — чисто (0 trailing-whitespace в добавленном контенте; pre-existing
  markdown hard-line-break в соседних строках Post-WR ROI датируется до claim
  этой TZ, не является частью правки).

═══════════════════════════════════════════════════════════════
ARCHIVE_MARKER
═══════════════════════════════════════════════════════════════

outcome: DONE
closed_at: 2026-08-23
closed_by: claude
verification:
  - acceptance criteria: PASS (файл + ссылка из war-room; git diff --check PASS на изменения TZ)
  - typecheck: N/A (docs-only)
  - tests: N/A (docs-only)
  - lint: N/A (docs-only)
  - checklist: ADDED (`docs/agent-checklists/TZ-UI-ROI-520.md`)
  - progress.md: N/A (docs-only micro-TZ)
  - status synchronization: `docs/agent-checklists/_NOW.md` не тронут — вне CONFLICT KEYS этой TZ, файл параллельно правится другими агентами; статус этой TZ виден через archive + war-room ссылку
