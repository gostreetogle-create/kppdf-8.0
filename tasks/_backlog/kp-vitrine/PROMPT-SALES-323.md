# PROMPT — TZ-SALES-323 (первая TZ wave-2)

Скопируй блок ниже локальному исполнителю (Gemini/Buffy).

---

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-SALES-323.md + checklist docs/agent-checklists/TZ-SALES-323.md по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP (особенно proposal-create* / document-template.service.ts)
5) Team Room claim best-effort

Затем:
- Прочитай GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4
- Прочитай и выполни: tasks/_backlog/kp-vitrine/TZ-SALES-323-create-kp-a4-fit-no-scroll.md
- Контекст-аудит: docs/audits/2026-08-09-kp-create-preview-wave2.md §A
- Spec LOCK: docs/ux/kp-create-studio-spec.md §0 — rails/overlay не ломать

Цель одной фразой: лист A4 в Create КП целиком влезает без H/V scrollbar (чинить и FE scale, и CSS overflow в build HTML — body padding vs doc-content min-height).

Измеримо: iframe scrollWidth <= clientWidth+1 и scrollHeight <= clientHeight+1 (не только спрятать overflow снаружи).

НЕ делать в этой TZ: empty-table skeleton (324), draftLines bind (325), snapshot/322, print/320, builder drag, DOC-344, deploy.

Gates из TZ. Archive только после Cursor/PO visual PASS на scroll.
В checklist в конце — ## Executor report (auto) (commit full SHA).
```

---

**PO one-liner:** Лучше дать [`PROMPT-WAVE2-CONTINUOUS.md`](./PROMPT-WAVE2-CONTINUOUS.md) на всю очередь 323→324→325.
