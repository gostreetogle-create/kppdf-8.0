# Промпт исполнителю — TZ-SALES-317

Агент сделает **каркас** студии «Создать КП»: уберёт лишние надписи, свернёт товары/параметры в узкие icon-rails с раскрытием, а лист A4 поднимет и впишет в экран без скролла страницы. Глубокие категории и сохранение КП — не трогает.

Скопируй блок ниже агенту (Gemini / local):

```text
CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-SALES-317.md + checklist docs/agent-checklists/TZ-SALES-317.md по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort

Затем: прочитай GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4
+ docs/ux/kp-create-studio-spec.md (v2 focus shell)
+ docs/audits/2026-08-09-kp-create-studio-layout-audit.md
+ tasks/_backlog/kp-vitrine/TZ-SALES-317-create-kp-focus-shell.md
и выполни TZ-SALES-317.

Суть: /proposals/create — maximize A4 center; remove H1/zone titles; left/right icon-rails; left cascade stub L1+reuse product-rail L2; right inspector in flyout (default closed); click-outside+Escape; no page scroll from product list; keep draftLines in-memory; no backend/print/save.

Gates:
  cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
  cd frontend && pnpm test -- --testPathPattern=proposal-create

Archive только после Cursor/PO PASS (visual). Перед archive — ## Executor report (auto) в checklist.
```
