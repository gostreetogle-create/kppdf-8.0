# PROMPT — Claude continuous: DocStudio list — drop «Новое КП» + no sentinel spam

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + how-to-connect-ai + kppdf-executor-loop.
UNATTENDED. Не спрашивай «продолжать?».

═══ WAVE-NX-DOCSTUDIO-LIST-TEMPLATES-CLEAN ═══
После DONE: WAVE-NX-DOCSTUDIO-CATALOG-TABLE-IA (b3908178).
Audit: docs/audits/2026-09-12-docstudio-list-kp-and-blank-templates-audit.md
WAVE: docs/agent-checklists/WAVE-NX-DOCSTUDIO-LIST-TEMPLATES-CLEAN.md

Чеклист: создай/веди docs/agent-checklists/DOCSTUDIO-LIST-TEMPLATES-CLEAN-CHECKLIST.md
(IN_WORK/DONE+SHA по 1→2). Architect gate 5–10 мин перед стадией.
Глобальный коллапс → deferred + next. Мелкие on-path ok.

═══ ОЧЕРЕДЬ ═══
1) tasks/_ready/nx-docstudio/TZ-NX-DOCSTUDIO-LIST-DROP-NEW-KP.md
   Убрать «Новое КП» с /studio. Оставить Шаблоны | Из шаблона | Создать документ.
   КП-вход живёт на /proposals («Создать в студии»). Не ломать quotation bridge.

2) tasks/_ready/nx-docstudio/TZ-NX-DOCSTUDIO-TEMPLATES-NO-SENTINEL-SPAM.md
   «Из шаблона» / /studio/templates: только явно сохранённые шаблоны.
   Скрыть system-sentinel-blank-a4 («Пустой A4») из list UI.
   findAll: deletedAt null + exclude sentinel tag.
   Dedup лишних sentinel per org (soft-delete) + усилить ensureBlankA4Sentinel (idempotent).
   Sentinel ОСТАВИТЬ для finalize blank — только не показывать в picker.
   Empty: «Нет сохранённых шаблонов…».

После каждой: claim→gates (nx build last)→archive→commit→push→чеклист→next.
Финал: WAVE COMPLETE; _NOW IDLE; Executor report #→SHA.

НЕ: catalog table IA снова; wipe всей templates; deploy; /production; auto-save template on editor close.
```
