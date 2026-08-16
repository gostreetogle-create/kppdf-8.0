# PROMPT — TZ-UX-326 (скопировать агенту)

CLAIM первым (до кода):
1) Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
2) `tasks/_active/TZ-UX-326.md` + checklist `docs/agent-checklists/TZ-UX-326.md` по `_TEMPLATE.md`
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) Чужие `_active` → STOP при пересечении keys (`products.page.ts`).
   TZ-UX-332 (form-dialog) и TZD-48 (desktop) — другие keys, не трогать.
5) Team Room claim best-effort

Затем:
Прочитай `docs/AI-AGENT-GUIDE.md`, `docs/pages/page-chrome.md` (§ Page tools),
`docs/audits/2026-08-15-chrome-page-tools-migration-audit.md`,
эталон `production-cockpit.page.ts` (`syncChromeTools` / PiChromeToolsService),
и выполни целиком `tasks/TZ-UX-326-products-chrome-page-tools.md`.

PO: воронка фильтра с локальной полоски у таблицы Продукции → в app-chrome-rail под ←→; колонку w-12 убрать.

Deploy/wipe запрещены. Archive после Cursor/PO PASS.
