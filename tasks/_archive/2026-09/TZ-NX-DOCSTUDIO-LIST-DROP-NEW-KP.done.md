# TZ-NX-DOCSTUDIO-LIST-DROP-NEW-KP: убрать «Новое КП» со списка Документов

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** PO 2026-09-12 скрин `/studio` — кнопка не по логике универсальных документов  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/studio`  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`  
**AUDIT:** `docs/audits/2026-09-12-docstudio-list-kp-and-blank-templates-audit.md`

### Preflight Check Output
- **Context read:** `studio-list.page.ts` «Новое КП» + `createKp`; S33 checklist; `/proposals` «Создать в студии»
- **Key Constraints:** убрать с list; КП-путь оставить на Сделках
- **Planned Deliverable:** remove button + dead code path if unused; page.md
- **Validation Path:** list spec; nx build

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts` (+ specs) ;  
`docs/pages/document-studio.page.md` ; checklist S33 note supersede

IMPLICIT CONFLICT: nx build kppdf-web

## РЕШЕНИЕ (PO)

На `/studio` остаются: **Шаблоны** | **Из шаблона** | **Создать документ**.  
Кнопки **«Новое КП» нет**.

КП создают из **Сделки → КП** («Создать в студии») или позже из **явного** шаблона «КП» через «Из шаблона».

## ЧТО ДЕЛАТЬ

1. Удалить кнопку `data-test="studio-create-kp"` и метод `createKp()` (или оставить helper только если proposals ещё импортирует — сейчас proposals свой путь; не тащить мёртвый код).
2. Specs list: кнопки КП нет; create / from-template / templates link остаются.
3. page.md: список CTA без «Новое КП»; одна строка «КП → из раздела Сделки».
4. Не ломать `/proposals` «Создать в студии».

## НЕ
Удалять docType КП; ломать quotation bridge; менять «Создать документ» dialog.

## AC
1. На `/studio` нет «Новое КП».  
2. Create + Из шаблона + Шаблоны работают.  
3. `/proposals` CTA студии жив.  
4. Specs + nx build green.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-12
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (nx test kppdf-web — 122 suites / 849 tests)
  - lint: not re-run separately this stage — small deletion-only diff, no new lint-relevant patterns
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DOCSTUDIO-LIST-DROP-NEW-KP.md)
  - progress.md: N/A (combined entry at WAVE COMPLETE)
  - status synchronization: PASS
