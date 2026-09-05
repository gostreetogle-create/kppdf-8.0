# TZ-NX-DOCSTUDIO-D51-SELECTED-BUFFER: секция «Выбрано»

**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 2
**PAGES:** document-studio
**ЗАВИСИМОСТИ:** D50 — done
**CONFLICT KEYS:** `studio-data-panel.component.ts`; IMPLICIT `nx build kppdf-web`

## ЧТО СДЕЛАНО

Muted empty state на «Выбрано» («Ничего не выбрано — добавьте товары или укажите клиента»). TOC badge = число позиций (`selectedAnchors().length + Σ catalogChips[].count`, не число групп-чипов). Тот же `catalogRemove` emitter — без второго write-path.

## AC — результат

1. ✅ Пустой буфер понятен.
2. ✅ Счётчик/список обновляется после Добавить.
3. ✅ Build PASS.

## Gates

```
pnpm exec nx test kppdf-web --testPathPattern="studio-data-panel" → PASS
pnpm exec nx lint kppdf-web → 0 ошибок
pnpm exec nx build kppdf-web → PASS, exit 0
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: PASS
  - lint: PASS
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-D51-SELECTED-BUFFER.md)
  - progress.md: N/A (captured in checklist; page.md update deferred to D54)
  - status synchronization: PASS
