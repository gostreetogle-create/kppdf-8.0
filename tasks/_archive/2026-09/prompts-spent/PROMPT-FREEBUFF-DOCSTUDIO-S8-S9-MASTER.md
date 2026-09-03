# PROMPT — Freebuff: Doc Studio S8→S9 (RESUME с пункта 3)

> **Resume 2026-09-01:** S8-1/2 DONE и запушены. S8-3 WIP в working tree — заблокирован wrong service.  
> Один агент. Параллель запрещён.

---

```
═══ START — вставь Freebuff ═══

Ты — continuous executor kppdf-8.0. Репо: D:\kppdf-8.0, main, не worktree.

Прочитай:
  GEMINI.md · .agents/skills/kppdf-executor-loop/SKILL.md
  docs/agent-checklists/WAVE-DOCSTUDIO-S8-S9.md   ← RESUME отсюда
  tasks/TZ-NX-DOCSTUDIO-S8-LIST-TEMPLATES.md      ← блокер + fix

Режим: не останавливайся до closeout пункта 7. Не спрашивай PO «продолжать?».

────────────────────────────────────────
УЖЕ СДЕЛАНО (не переделывай)
────────────────────────────────────────
[x] S8-1 TEXT-SUBSTITUTION — commit 96d08634 · archive tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S8-TEXT-SUBSTITUTION.done.md
[x] S8-2 TABLE-ERP-BIND — commit 34f50b3c · archive tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S8-TABLE-ERP-BIND.done.md

WIP S8-3 (uncommitted, доделать):
  + PiStudioDocumentsService.createFromTemplate() — OK
  + кнопки «Из шаблона», «Дублировать», data-test — OK
  ✗ createFromTemplate() в studio-list.page.ts использует PiTableTemplatesService — НЕВЕРНО
    (table-templates ≠ document-templates)

────────────────────────────────────────
PREFLIGHT
────────────────────────────────────────
1. git fetch && git merge origin/main
2. tasks/_active/ пуст
3. cd frontend-nx && pnpm exec nx build kppdf-web — PASS expected
4. WAVE: agent_id + RESUME=пункт 3

────────────────────────────────────────
3. S8-3 LIST-TEMPLATES — ДОДЕЛАТЬ СНАЧАЛА
────────────────────────────────────────
Spec: tasks/TZ-NX-DOCSTUDIO-S8-LIST-TEMPLATES.md

Fix:
  A. Создай PiDocumentTemplatesService в frontend-nx/libs/data-access/src/lib/doc-studio/
     (port list() из frontend/src/app/shared/services/pi-document-templates.service.ts)
     API: GET /document-templates
  B. studio-list.page.ts: dialog выбора DocumentTemplate → service.createFromTemplate(id)
     Убери PiTableTemplatesService из list page.
  C. duplicate — оставить как есть (service.duplicate).

Gates: cd frontend-nx && pnpm exec nx build kppdf-web
Archive → commit → push → [x] в WAVE → пункт 4.

────────────────────────────────────────
4→7 — БЕЗ ПАУЗ (как в полной волне)
────────────────────────────────────────

4. TZ-NX-DOCSTUDIO-S8-PAGES-PANEL — tasks/TZ-NX-DOCSTUDIO-S8-PAGES-PANEL.md
   build kppdf-web → archive → commit → push

5. TZ-NX-DOCSTUDIO-S9-ANCHORS-MODEL — tasks/_backlog/doc-studio/TZ-NX-DOCSTUDIO-S9-ANCHORS-MODEL.md
   backend test studio-document|studio-output → build → archive → commit → push

6. TZ-NX-DOCSTUDIO-S9-CATALOG-VITRINA — tasks/_backlog/doc-studio/TZ-NX-DOCSTUDIO-S9-CATALOG-VITRINA.md
   backend test studio-data-resolver → build → archive → commit → push
   PO canon: 4 вкладки витрины; toggle → сразу строки в таблице

7. TZ-NX-DOCSTUDIO-S9-TEMPLATE-BINDINGS-UX — tasks/_backlog/doc-studio/TZ-NX-DOCSTUDIO-S9-TEMPLATE-BINDINGS-UX.md
   build → archive → commit → push → CLOSEOUT

CLOSEOUT: WAVE DONE · QUEUE-LIVE · _NOW.md · отчёт PO одной строкой.

COMMIT после каждой archived TZ. Push после commit. Не stage чужой WIP (docker-compose, data/, docs PO).

═══ END ═══
```
