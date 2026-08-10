# Промпт исполнителю — archive TZ-SALES-317 → затем TZ-SALES-319

Оркестратор: Cursor PASS visual на **317** уже дан. Агент **сначала закрывает 317**, потом делает вставку шаблона **319**. Не ждать «поехали».

Скопируй блок ниже агенту:

```text
Оркестратор: Cursor Verdict PASS на TZ-SALES-317 (shell). Сделай строго по порядку.

═══ ШАГ A — archive TZ-SALES-317 ═══
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) Прочитай docs/agent-checklists/TZ-SALES-317.md + GEMINI.md closeout
3) НЕ пиши новый код по 317. Только closeout:
   - checklist Status = DONE; Review handoff PASS отмечен; closed_at ISO
   - progress.md запись «Завершено: TZ-SALES-317»
   - lock .mimocode/locks/TZ-SALES-317-create-kp-focus-shell.lock (если ещё нет)
   - tasks/_archive/2026-08/TZ-SALES-317.done.md (ARCHIVE_MARKER)
   - удалить tasks/_active/TZ-SALES-317.md
   - обновить docs/agent-checklists/_active-map.md (317 DONE)
   - commit + push только файлы closeout 317 (не чужой WIP)
4) Убедись: tasks/_active/ БОЛЬШЕ НЕТ TZ-SALES-317.md

═══ ШАГ B — CLAIM + выполнить TZ-SALES-319 ═══
5) tasks/_active/TZ-SALES-319.md + checklist docs/agent-checklists/TZ-SALES-319.md
6) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
7) _active-map + чужие keys → конфликт = STOP
8) Прочитай:
   docs/audits/2026-08-09-kp-create-template-insert-fidelity-audit.md
   docs/ux/kp-create-studio-spec.md (§0 FROZEN — shell не ломать)
   tasks/_backlog/kp-vitrine/TZ-SALES-319-create-kp-template-build-preview.md
9) Выполни TZ-SALES-319:
   center Create КП ← DocumentTemplatesService.build() HTML (iframe/srcdoc);
   убрать stub name/description/«упрощённое»/draftLines на листе;
   organizationId из inspector stateChange если есть;
   не трогать DOC-344 builder, TABLES-305, print 320, persist quotation.
10) Gates:
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern=proposal-create
11) READY FOR REVIEW + ## Executor report (auto). Archive 319 только после Cursor/PO visual PASS (шаблон с фоном).
Deploy: НЕТ.
```
