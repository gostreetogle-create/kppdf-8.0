# PROMPT — WAVE DICT DEMO (continuous)

Скопируй агенту-исполнителю целиком.

---

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0 (canonical main, не .freebuff)
2) tasks/_active/<TASK-ID>.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
5) Team Room claim best-effort

Очередь (строго по порядку, без стопов «ок/поехали»):

0. **TZ-PRODUCTS-310** `tasks/TZ-PRODUCTS-310-formdialog-bompanel-circular-cmp.md` — P0 ɵcmp edit изделия
1. **TZ-DICT-317** `tasks/TZ-DICT-317-units-crud-edit-roles.md`
2. **TZ-DICT-318** `tasks/TZ-DICT-318-ral-auto-prefix.md`
3. **TZ-MATERIALS-312** `tasks/TZ-MATERIALS-312-supplier-empty-dims-half.md`
4. **TZ-CATALOG-338** `tasks/TZ-CATALOG-338-article-required-unique.md`
5. **TZ-DICT-319** `tasks/TZ-DICT-319-kind-labels-dictionary-be.md`
6. **TZ-DICT-320** `tasks/TZ-DICT-320-kind-labels-fe-nav.md`
7. **TZ-UX-DIALOG-306** `tasks/TZ-UX-DIALOG-306-composition-picker-qty.md`
8. **TZ-UX-DIALOG-307** `tasks/TZ-UX-DIALOG-307-save-and-continue-hotkey.md`

Волна: `tasks/_backlog/dictionaries/WAVE-DICT-DEMO-2026-08-10.md`  
Аудит: `docs/audits/2026-08-10-dictionaries-demo-audit.md`  
Skills: `GEMINI.md` + `.agents/skills/kppdf-executor-continuous/SKILL.md` + `docs/AI-AGENT-GUIDE.md`

На каждый TZ: code → gates из AC → checklist `## Executor report (auto)` → archive → commit/push → next.

BAN: deploy.ps1; WAVE-KP-COMPLETE/SALES-340+; SUPPLY-303 (park); restore dictionaries hub; EAV; чужой dirty WIP.

Пустая очередь → отчёт «готово предложить деплой». Deploy NO.
