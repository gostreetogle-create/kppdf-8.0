# TZ-NX-DOCSTUDIO-C4: Docs / Integrity closeout Chrome IA

**РОЛЬ АГЕНТА:** Executor (docs + thin specs) — Freebuff  
**ЗАВИСИМОСТИ:** TZ-NX-DOCSTUDIO-C3 DONE  
**LAYER:** 2  
**SIZE:** S  
**PACK:** WAVE-DOCSTUDIO-CHROME-IA · `tasks/PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA.md`

**PAGES:** `/studio` ; `/studio/templates` ; `/studio/:id`  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`docs/pages/document-studio.page.md` ;  
`docs/pages/PAGE-TZ-INDEX.md` ;  
`docs/DOMAIN-MAP.md` (строка studio/NX если устарела) ;  
`docs/agent-checklists/WAVE-DOCSTUDIO-CHROME-IA.md` ;  
`docs/audits/2026-09-06-docstudio-chrome-ia-audit.md` (status DONE) ;  
`docs/FEATURE-INTEGRATION-CHECKLIST.md` (только если C2 добавил route — галка §A)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web (smoke only; код не менять без бага)

---

### Preflight Check Output
- **Context read:** C1–C3 archives; document-studio.page.md; PAGE-TZ-INDEX; FIC §A
- **Key Constraints:** docs = код; не трогать product logic
- **Planned Deliverable:** SoT pages + index + WAVE done markers
- **Validation Path:** DOCS-INTEGRITY; nx build smoke

---

## ИСХОДНОЕ СОСТОЯНИЕ

После C1–C3 код уже другой; page.md / индексы могут отставать (старый ribbon §1.2, нет `/studio/templates`).

---

## ЧТО ДЕЛАТЬ

1. `document-studio.page.md`: таблица routes (Документы / Шаблоны / Студия); §1.2 = crumbs only; §1.3 rails включают mode/save/pdf/archive; убрать устаревшие «К списку» как primary.
2. `PAGE-TZ-INDEX.md`: строка WAVE-DOCSTUDIO-CHROME-IA C1–C4 DONE + пути archive.
3. `DOMAIN-MAP.md`: NX колонка studio — три path если была одна.
4. WAVE checklist + audit: status **DONE** + commit SHAs.
5. FIC §A: подтвердить pageKey/nav для templates.
6. `_NOW.md`: Chrome IA → DONE; next per PO.

## НЕ ИЗМЕНЯТЬ
- Product TS кроме если doc drift нашёл явный баг → STOP + note, не «заодно».
- Другие WAVE (photos, S45, warehouse).

## КРИТЕРИИ ПРИЁМКИ

1. page.md совпадает с UI глазом (три раздела + crumbs + rail actions).
2. Индексы ссылаются на archive paths.
3. `nx build kppdf-web` всё ещё green (smoke).

## BUILD INTEGRITY

Baseline + final: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0

**known_limitation:** N/A
