# Промпт исполнителю — TZ-SALES-319

Агент сделает **настоящую вставку шаблона** в «Создать КП»: вместо карточки с названием — HTML с сервера (`build`), как бланк с фонами, текстами и таблицами. Каркас студии (rails) не трогает. Стартовать **только после** закрытия SALES-317.

Скопируй блок ниже агенту (Gemini / local):

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) Убедись: tasks/_active/ НЕ содержит TZ-SALES-317 (иначе STOP / DEFER)
3) tasks/_active/TZ-SALES-319.md + checklist docs/agent-checklists/TZ-SALES-319.md по docs/agent-checklists/_TEMPLATE.md
4) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
5) _active-map + чужие keys → конфликт = STOP
6) Team Room claim best-effort

Затем: прочитай GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4
+ docs/audits/2026-08-09-kp-create-template-insert-fidelity-audit.md
+ docs/ux/kp-create-studio-spec.md (§0 FROZEN shell)
+ tasks/_backlog/kp-vitrine/TZ-SALES-319-create-kp-template-build-preview.md
и выполни TZ-SALES-319.

Суть: /proposals/create center — убрать stub (name/description/«упрощённое»/draftLines на листе);
при выборе шаблона вызвать DocumentTemplatesService.build(id, { organizationId? });
показать HTML в sandbox iframe/srcdoc, scale contain в A4 sheet; rebuild при смене шаблона/org;
не трогать builder/DOC-344, cascade 318, print 320, persist quotation.

Gates:
  cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
  cd frontend && pnpm test -- --testPathPattern=proposal-create

Archive только после Cursor/PO visual PASS (шаблон с фоном). Перед archive — ## Executor report (auto) в checklist.
Deploy: НЕТ.
```
