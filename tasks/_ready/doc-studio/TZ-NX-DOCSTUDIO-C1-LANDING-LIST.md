# TZ-NX-DOCSTUDIO-C1: Landing = список, без auto-resume

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Freebuff  
**ЗАВИСИМОСТИ:** Нет (первый в WAVE-DOCSTUDIO-CHROME-IA)  
**LAYER:** 3  
**SIZE:** S  
**PACK:** WAVE-DOCSTUDIO-CHROME-IA · `tasks/PROMPT-FREEBUFF-DOCSTUDIO-CHROME-IA.md`

**PAGES:** `/studio`  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-session.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-session.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/layout/app-shell-constructor-nav.spec.ts`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — полная сборка приложения (nx build kppdf-web)

---

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-06-docstudio-chrome-ia-audit.md`; `studio-list.page.ts` ~90–95; `studio-session.ts`; `nav-categories.ts` ~145–156
- **Key Constraints:** Mode A handoff; не трогать editor ribbon (C3); A4 N/A
- **Planned Deliverable:** «Докум.» → список; auto-resume выключен
- **Validation Path:** unit specs + nx build; FIC nav

**Проверено:** audit §1; `pickResumeStudioDocument`; entryPath fallback.

Loose wording → канон: «открываются документы» = клик чипа `docs` → `/studio` list.

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. `StudioListPage.load()` после успешного `list()` зовёт `pickResumeStudioDocument(rows)` и при draft **сразу** `navigate(['/studio', resume._id])`, если нет `?list=1`.
2. `nav-categories` docs.`entryPath` = `/doc-constructor/templates` (нет на NX) → fallback `/studio` → снова auto-resume → оператор в редакторе.
3. `rememberStudioDocument` остаётся нужен для других входов (КП → студия); **не** для принудительного reopen с list.

**Сбои:**
- PO открывает «Докум.» → чужой/прошлый редактор.
- «К списку» с `?list=1` — костыль, который не знает чип навбара.
- Новый сотрудник ищет список — его нет на первом экране.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Убрать auto-resume с `/studio`
- В `studio-list.page.ts` **удалить** блок `pickResumeStudioDocument` / auto-`navigate` из `load()`.
- Список всегда рендерится (`status = success`) после list.
- `?list=1` можно оставить no-op или убрать из callers позже (C3); не обязателен.
- Обновить/добавить spec: после load **нет** navigation на `:id`; строки списка видны.

### ШАГ 2 — Чип «Докум.» → `/studio`
- `nav-categories.ts`: `docs.entryPath = '/studio'`.
- Specs: `entryPath === '/studio'`; constructor-nav spec — обновить комментарий/ожидание (больше не «fallback because templates missing», а явный entry).
- **Не** добавлять ещё routes (это C2).

### ШАГ 3 — session helper
- `pickResumeStudioDocument` — либо удалить, либо оставить exported **без** вызова из list (если нужен тестам/будущему) + комментарий «не вызывать с landing».
- `rememberStudioDocument` / `readLastStudioDocumentId` — сохранить (редактор и create flows).

---

## ИЗМЕНЯТЬ
- Файлы из CONFLICT KEYS.

## НЕ ИЗМЕНЯТЬ
- `studio-editor.page.ts` ribbon / rails (C3).
- Backend, registries, Data IA panels.
- `frontend/**` legacy.
- Новые routes `/studio/templates` (C2).

---

## КРИТЕРИИ ПРИЁМКИ

1. Клик «Докум.» / переход на `/studio` → виден список (`data-test="studio-list"`), **нет** автоперехода на `/studio/:id`.
2. `entryPath` категории docs = `/studio` (spec green).
3. Create / open row / duplicate по-прежнему открывают редактор и пишут last-doc id.
4. Gates ниже PASS.

## BUILD INTEGRITY (обязательно)

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

Baseline (до CLAIM):
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0

Gates (закрытие, nx build — ПОСЛЕДНИЙ):
  cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  cd frontend-nx && pnpm test -- studio-list studio-session nav-categories app-shell-constructor-nav
  cd frontend-nx && pnpm lint
  cd frontend-nx && pnpm exec nx build kppdf-web  → exit 0  ← обязательно последним

Параллель: STOP если в tasks/_active/ другой TZ с kppdf-web/src/**

**known_limitation:** отдельной страницы шаблонов ещё нет (C2); мёртвые `/doc-constructor/*` в items остаются до C2.
