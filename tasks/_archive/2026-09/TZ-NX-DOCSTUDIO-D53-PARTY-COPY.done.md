# TZ-NX-DOCSTUDIO-D53-PARTY-COPY: Кому / Связи / Ещё

**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 2
**PAGES:** document-studio
**ЗАВИСИМОСТИ:** D50
**CONFLICT KEYS:** `studio-data-panel.component.ts`; IMPLICIT `nx build kppdf-web`

## ЧТО СДЕЛАНО

Плательщик → secondary disclosure («Указать плательщика отдельно», открыт сразу если значение уже есть). Связи → одна строка-подсказка сверху. Ещё → hint под Поставщиком; Исполнитель → «Наша фирма: {name}». Не менял context API/emitters — только IA/copy/visibility, как требовал TZ.

## AC — результат

1. ✅ На «Товарах» нет select'ов КП/клиента.
2. ✅ «Кому» показывает клиента первым.
3. ✅ Build PASS.

## Gates

```
pnpm exec nx test kppdf-web --testPathPattern="studio-data-panel" → PASS (18/18)
pnpm exec nx lint kppdf-web → 0 ошибок
pnpm exec nx build kppdf-web → PASS, exit 0
```

Observed (не мой fix, BAN zone): 1 нестабильный fail в `pages/production/**` (Freebuff live WIP, меняется между прогонами) — не трогал.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: PASS
  - lint: PASS
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-D53-PARTY-COPY.md)
  - progress.md: N/A (captured in checklist; page.md update in D54)
  - status synchronization: PASS
