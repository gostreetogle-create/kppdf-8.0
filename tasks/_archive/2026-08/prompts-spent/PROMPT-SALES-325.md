# PROMPT — TZ-SALES-325 (после PASS 323 и 324)

Скопируй блок ниже локальному исполнителю. **Не claim**, пока 323 и 324 не DONE + visual PASS.

---

```text
CLAIM первым (до кода) — только если TZ-SALES-323 и TZ-SALES-324 уже DONE/archived:
1) Get-Location + git rev-parse → D:\kppdf-8.0; git pull --ff-only если clean
2) tasks/_active/TZ-SALES-325.md + checklist docs/agent-checklists/TZ-SALES-325.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map → конфликт на proposal-create* / build-document.dto / document-template.service / pi-document-templates.service = STOP
5) DOC-344 builder WIP / pi-document-templates.service overlap → STOP или DEFER
6) Team Room claim best-effort

Затем:
- GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4
- Выполни: tasks/_backlog/kp-vitrine/TZ-SALES-325-draftlines-table-bind.md
- Аудит: docs/audits/2026-08-09-kp-create-preview-wave2.md §C
- Spec LOCK: docs/ux/kp-create-studio-spec.md §0

Цель: добавил изделие в рейл → после debounced build() строки видны в НАЗНАЧЕННОЙ line-items таблице бланка (не во всех live tables).

Контракт:
- DTO previewLines (optional); не писать в Quotation/Mongo
- column.key aliases из TZ (не labels)
- Target table: settings.kpLineItems===true (или role line-items); иначе ровно 1 live table; иначе none + skeleton 324
- snapshot mode не трогать

НЕ делать: fill all live tables; fuzzy labels; snapshot/322; print/320; BuilderCanvas; deploy; Save persist.

Gates из TZ. Visual PASS: товары в правильной таблице + scroll OK + skeleton empty OK.
Executor report (auto); archive после Cursor/PO PASS; commit+push scoped 325; deploy NO.
```

---

**PO one-liner:** Claim 325 только после visual PASS 323+324.
